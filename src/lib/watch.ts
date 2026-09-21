import { storyBeats } from '@/content/story';

const VISIT_KEY = 'v-watch';

type Watch = {
  id: string;
  visits: number;
};

function labels(section: string) {
  if (section === 'historia') return 'Historia';
  if (section === 'lista') return 'Lista';
  if (section === 'archivo') return 'Archivo';
  if (section === 'mapa') return 'Mapa';
  if (section === 'secretos') return 'Confidencial';
  if (section === 'conclusion') return 'Conclusión';
  if (section === 'investigacion') return 'Investigación';
  return section;
}

function loadWatch(): Watch {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Watch;
      if (parsed.id && parsed.visits >= 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { id: Math.random().toString(36).slice(2, 8), visits: 0 };
}

function saveWatch(watch: Watch) {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(watch));
  } catch {
    /* ignore */
  }
}

let sessionSent = false;
let cachedWhere: string | null | undefined;

async function locate() {
  if (cachedWhere !== undefined) return cachedWhere;
  cachedWhere = null;
  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as {
        success?: boolean;
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        connection?: { isp?: string };
      };
      if (data.success !== false) {
        const place = [data.city, data.region, data.country].filter(Boolean).join(', ');
        const isp = data.connection?.isp;
        cachedWhere = [place, data.ip, isp].filter(Boolean).join(' · ');
        return cachedWhere;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
    if (!res.ok) return cachedWhere;
    const data = (await res.json()) as {
      ip?: string;
      city?: string;
      region?: string;
      country?: string;
      organization?: string;
    };
    const place = [data.city, data.region, data.country].filter(Boolean).join(', ');
    cachedWhere = [place, data.ip, data.organization].filter(Boolean).join(' · ');
  } catch {
    /* ignore */
  }
  return cachedWhere;
}

function pingWithWhere(text: string) {
  void locate().then((where) => {
    ping(where ? `${text}\n${where}` : text);
  });
}

export function ping(text: string) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN?.trim();
  const chat = import.meta.env.VITE_TELEGRAM_CHAT_ID?.trim();
  if (!token || !chat) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${encodeURIComponent(chat)}&text=${encodeURIComponent(text)}`;
  void fetch(url, { mode: 'no-cors', keepalive: true }).catch(() => undefined);
}

export function pingSession(kind: 'gate' | 'return') {
  if (sessionSent) return;
  sessionSent = true;
  const watch = loadWatch();
  watch.visits += 1;
  saveWatch(watch);
  if (kind === 'gate' && watch.visits <= 1) {
    pingWithWhere(`Puerta · primera vez · ${watch.id}`);
    return;
  }
  if (kind === 'gate') {
    pingWithWhere(`Puerta otra vez · visita ${watch.visits} · ${watch.id}`);
    return;
  }
  pingWithWhere(`Volvió · visita ${watch.visits} · ${watch.id}`);
}

export function pingSection(section: string) {
  ping(`Abrió ${labels(section)}`);
}

export function pingUniverse() {
  ping('Exploró el universo');
}

function historiaSlide(beatIndex: number, depth: number) {
  const beat = storyBeats[beatIndex];
  if (!beat) return '?';
  if (depth <= 0) return `${beat.index} ${beat.title} · portada`;
  const detail = beat.details[depth - 1];
  const step = detail?.kicker ?? String(depth);
  const title = detail?.title ?? '';
  return `${beat.index}.${step} ${title}`.trim();
}

function watchTime(seconds: number) {
  if (seconds < 2) return 'pasó rápido';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function archivoItem(id: number, kind?: 'image' | 'video') {
  return `${kind === 'video' ? 'vídeo' : 'foto'} ${id}`;
}

let archivoLeft = false;
let archivoOpenedAt = 0;
let archivoPhoto: { id: number; kind?: 'image' | 'video'; at: number } | null = null;

export function pingArchivoEnter() {
  archivoLeft = false;
  archivoOpenedAt = Date.now();
  archivoPhoto = null;
}

export function pingArchivoPhoto(
  how: 'click' | 'siguiente' | 'anterior',
  id: number,
  kind?: 'image' | 'video',
) {
  const prev = archivoPhoto;
  const now = Date.now();
  if (prev) {
    const spent = watchTime(Math.round((now - prev.at) / 1000));
    if (how === 'click') {
      ping(`Archivo · click ${archivoItem(id, kind)} · ${spent} en ${archivoItem(prev.id, prev.kind)}`);
    } else {
      const arrow = how === 'siguiente' ? '→' : '←';
      ping(
        `Archivo · ${how} ${arrow} ${archivoItem(id, kind)} · ${spent} en ${archivoItem(prev.id, prev.kind)}`,
      );
    }
  } else {
    ping(`Archivo · click ${archivoItem(id, kind)}`);
  }
  archivoPhoto = { id, kind, at: now };
}

export function pingArchivoPhotoClose() {
  const prev = archivoPhoto;
  if (!prev) return;
  ping(
    `Archivo · cerró ${archivoItem(prev.id, prev.kind)} · ${watchTime(Math.round((Date.now() - prev.at) / 1000))}`,
  );
  archivoPhoto = null;
}

export function pingArchivoLeave() {
  if (archivoLeft) return;
  archivoLeft = true;
  pingArchivoPhotoClose();
  ping(`Archivo · salió · ${watchTime(Math.round((Date.now() - archivoOpenedAt) / 1000))}`);
}

export function pingArchivoLike(id: number, kind: 'image' | 'video' | undefined, liked: boolean) {
  ping(`Archivo · ${liked ? 'like' : 'unlike'} ${archivoItem(id, kind)}`);
}

export function pingArchivoComment(id: number, kind: 'image' | 'video' | undefined, text: string) {
  ping(`Archivo · comentario ${archivoItem(id, kind)} · "${text}"`);
}

export function pingArchivoDownload(id: number, kind: 'image' | 'video' | undefined) {
  ping(`Archivo · descarga ${archivoItem(id, kind)}`);
}

export function pingHistoriaOpen(beatIndex: number, depth: number) {
  ping(`Historia · lee ${historiaSlide(beatIndex, depth)}`);
}

export function pingHistoriaMove(
  fromBeat: number,
  fromDepth: number,
  toBeat: number,
  toDepth: number,
  seconds: number,
) {
  const how = fromBeat !== toBeat ? (toBeat > fromBeat ? '→' : '←') : toDepth > fromDepth ? '↓' : '↑';
  ping(
    `Historia · ${how} ${historiaSlide(toBeat, toDepth)} · ${watchTime(seconds)} en ${historiaSlide(fromBeat, fromDepth)}`,
  );
}

export function pingHistoriaLeave(beatIndex: number, depth: number, seconds: number) {
  ping(`Historia · salió · ${watchTime(seconds)} en ${historiaSlide(beatIndex, depth)}`);
}

export function pingHistoriaMap(beatIndex: number, depth: number) {
  ping(`Historia · mapa desde ${historiaSlide(beatIndex, depth)}`);
}

export function pingListaChoice(id: number, title: string) {
  ping(`Lista · casilla ${String(id).padStart(2, '0')} · eligió ${title}`);
}

