const ARCHIVE_ALLOW_EMAILS = ['avzdiego00@gmail.com', 'avzcrypto@gmail.com', 'valeria.cruzar20@gmail.com'];
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const DRIVE_SCOPE = 'openid email https://www.googleapis.com/auth/drive.readonly';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SHORTCUT_MIME = 'application/vnd.google-apps.shortcut';
const SESSION_KEY = 'v-archive-session';
const MAX_FILES = 80;
const VIDEO_NAME = /\.(mp4|mov|m4v|webm|avi|mkv)$/i;
const IMAGE_NAME = /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i;

export type DriveMedia = {
  id: string;
  name: string;
  kind: 'image' | 'video';
  mimeType: string;
  src?: string;
  thumb?: string;
};

export type ArchiveSession = {
  email: string;
  token: string;
  items: DriveMedia[];
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  shortcutDetails?: { targetId?: string; targetMimeType?: string };
};

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            hint?: string;
            callback: (res: { access_token?: string; error?: string }) => void;
          }) => TokenClient;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

let gisReady: Promise<void> | null = null;
let liveSession: ArchiveSession | null = null;

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisReady) return gisReady;
  gisReady = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gis')));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('gis'));
    document.head.appendChild(script);
  });
  return gisReady;
}

function cleanEnv(raw?: string) {
  return (raw ?? '')
    .trim()
    .replace(/\r/g, '')
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/^VITE_[A-Z0-9_]+=/i, '')
    .replace(/^['"]+|['"]+$/g, '')
    .trim();
}

function normalizeEmail(value: string) {
  return cleanEnv(value).toLowerCase().replace(/@googlemail\.com$/, '@gmail.com');
}

function parseAllowList(raw?: string) {
  const matches = cleanEnv(raw).match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];
  return [...new Set(matches.map(normalizeEmail))];
}

function folderIdFromEnv(raw?: string) {
  const value = cleanEnv(raw);
  const fromUrl = value.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return fromUrl?.[1] ?? value;
}

export function archiveConfig() {
  return {
    clientId: cleanEnv(import.meta.env.VITE_GOOGLE_CLIENT_ID),
    folderId: folderIdFromEnv(import.meta.env.VITE_DRIVE_FOLDER_ID),
    allow: [...new Set([...ARCHIVE_ALLOW_EMAILS.map(normalizeEmail), ...parseAllowList(import.meta.env.VITE_ARCHIVE_EMAILS)])],
  };
}

export function isArchiveConfigured() {
  const { clientId, folderId } = archiveConfig();
  return Boolean(clientId && folderId);
}

function readStoredAuth() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: string; token?: string };
    if (!parsed.email || !parsed.token) return null;
    return { email: parsed.email, token: parsed.token };
  } catch {
    return null;
  }
}

function writeStoredAuth(email: string, token: string) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, token }));
  } catch {
    /* private mode */
  }
}

export function getLiveSession() {
  return liveSession;
}

export function rememberSession(session: ArchiveSession) {
  liveSession = session;
  writeStoredAuth(session.email, session.token);
}

export function clearSession() {
  if (liveSession) revokeMediaUrls(liveSession.items);
  liveSession = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

async function tokenIsAlive(token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function signInToGoogle(opts?: { silent?: boolean; hint?: string }) {
  const { clientId } = archiveConfig();
  if (!clientId) throw new Error('missing-client');
  await loadGis();
  const oauth = window.google?.accounts.oauth2;
  if (!oauth) throw new Error('gis');

  const accessToken = await new Promise<string>((resolve, reject) => {
    const client = oauth.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      hint: opts?.hint,
      callback: (res) => {
        if (res.access_token) resolve(res.access_token);
        else reject(new Error(res.error || 'denied'));
      },
    });
    client.requestAccessToken({ prompt: opts?.silent ? '' : undefined });
  });

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) throw new Error('profile');
  const profile = (await profileRes.json()) as { email?: string };
  const email = normalizeEmail(profile.email ?? '');
  if (!email) throw new Error('profile');

  const { allow } = archiveConfig();
  if (allow.length > 0 && !allow.includes(email)) {
    signOutGoogle(accessToken);
    throw new Error(`forbidden-email:${email}`);
  }

  return { accessToken, email };
}

export async function restoreSession() {
  if (liveSession && (await tokenIsAlive(liveSession.token))) return liveSession;

  const stored = readStoredAuth();
  if (stored && (await tokenIsAlive(stored.token))) {
    const { folderId } = archiveConfig();
    const items = await listDriveMedia(stored.token, folderId);
    const session = { email: stored.email, token: stored.token, items };
    rememberSession(session);
    return session;
  }

  if (!stored?.email) return null;

  try {
    const fresh = await signInToGoogle({ silent: true, hint: stored.email });
    const { folderId } = archiveConfig();
    const items = await listDriveMedia(fresh.accessToken, folderId);
    const session = { email: fresh.email, token: fresh.accessToken, items };
    rememberSession(session);
    return session;
  } catch {
    return null;
  }
}

export function signOutGoogle(token?: string) {
  if (token && window.google?.accounts.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => undefined);
  }
  clearSession();
}

function kindOf(mimeType: string, name = ''): DriveMedia['kind'] | null {
  if (mimeType.startsWith('image/') || IMAGE_NAME.test(name)) return 'image';
  if (mimeType.startsWith('video/') || VIDEO_NAME.test(name)) return 'video';
  return null;
}

function thumbUrl(link?: string, fileId?: string) {
  if (link) return link.replace(/=s\d+/, '=s800');
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  return undefined;
}

async function driveGet<T>(accessToken: string, url: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) throw new Error('expired');
  if (res.status === 404) throw new Error('missing-folder');
  if (res.status === 403) throw new Error('forbidden-folder');
  if (!res.ok) throw new Error('drive');
  return (await res.json()) as T;
}

async function listChildren(accessToken: string, folderId: string) {
  const files: DriveFile[] = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        'nextPageToken,files(id,name,mimeType,thumbnailLink,shortcutDetails(targetId,targetMimeType))',
      pageSize: '50',
      supportsAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await driveGet<{ nextPageToken?: string; files?: DriveFile[] }>(
      accessToken,
      `https://www.googleapis.com/drive/v3/files?${params}`,
    );
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);

  return files;
}

async function collectMedia(accessToken: string, folderId: string, seen: Set<string>, out: DriveFile[]) {
  if (seen.has(folderId) || out.length >= MAX_FILES) return;
  seen.add(folderId);

  let children: DriveFile[] = [];
  try {
    children = await listChildren(accessToken, folderId);
  } catch (err) {
    if (seen.size > 1) return;
    throw err;
  }

  for (const file of children) {
    if (out.length >= MAX_FILES) return;

    if (file.mimeType === FOLDER_MIME) {
      await collectMedia(accessToken, file.id, seen, out);
      continue;
    }

    if (file.mimeType === SHORTCUT_MIME) {
      const targetId = file.shortcutDetails?.targetId;
      const targetMime = file.shortcutDetails?.targetMimeType ?? '';
      if (!targetId) continue;
      if (targetMime === FOLDER_MIME) {
        await collectMedia(accessToken, targetId, seen, out);
        continue;
      }
      if (kindOf(targetMime, file.name)) {
        out.push({
          id: targetId,
          name: file.name,
          mimeType: targetMime || file.mimeType,
          thumbnailLink: file.thumbnailLink,
        });
      }
      continue;
    }

    if (kindOf(file.mimeType, file.name)) out.push(file);
  }
}

export async function fetchDriveFile(accessToken: string, fileId: string) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true&acknowledgeAbuse=true`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) throw new Error('expired');
  if (res.status === 404) throw new Error('missing-folder');
  if (res.status === 403) throw new Error('forbidden-folder');
  if (!res.ok) throw new Error('drive');
  const blob = await res.blob();
  if (!blob.size) throw new Error('drive');
  return URL.createObjectURL(blob);
}

export async function listDriveMedia(accessToken: string, folderId: string) {
  const files: DriveFile[] = [];
  await collectMedia(accessToken, folderId, new Set(), files);

  return files.flatMap((file) => {
    const kind = kindOf(file.mimeType, file.name);
    if (!kind) return [];
    return [
      {
        id: file.id,
        name: file.name,
        kind,
        mimeType: file.mimeType,
        thumb: thumbUrl(file.thumbnailLink, file.id),
      } satisfies DriveMedia,
    ];
  });
}

export function revokeMediaUrls(items: DriveMedia[]) {
  for (const item of items) {
    if (item.src?.startsWith('blob:')) URL.revokeObjectURL(item.src);
  }
}
