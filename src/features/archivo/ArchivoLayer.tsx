import { useEffect, useState } from 'react';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import {
  archiveConfig,
  fetchDriveFile,
  getLiveSession,
  isArchiveConfigured,
  listDriveMedia,
  rememberSession,
  restoreSession,
  signInToGoogle,
  signOutGoogle,
  type DriveMedia,
} from '@/lib/googleDrive';

type Props = {
  onBack: () => void;
};

export function ArchivoLayer({ onBack }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/88 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip onClick={onBack} label="universo" />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Archivo</p>
      </header>

      <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
        <DriveVault />
      </div>
    </div>
  );
}

function DriveVault() {
  const configured = isArchiveConfigured();
  const live = getLiveSession();
  const [email, setEmail] = useState<string | null>(live?.email ?? null);
  const [token, setToken] = useState<string | null>(live?.token ?? null);
  const [items, setItems] = useState<DriveMedia[]>(live?.items ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<DriveMedia | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(Boolean(configured && !live));

  useEffect(() => {
    if (email && token) rememberSession({ email, token, items });
  }, [email, token, items]);

  useEffect(() => {
    if (!configured || live) {
      setRestoring(false);
      return;
    }
    let gone = false;
    void restoreSession()
      .then((session) => {
        if (gone || !session) return;
        setEmail(session.email);
        setToken(session.token);
        setItems(session.items);
      })
      .finally(() => {
        if (!gone) setRestoring(false);
      });
    return () => {
      gone = true;
    };
  }, [configured, live]);

  const enter = async () => {
    haptic('medium');
    setBusy(true);
    setError(null);
    try {
      const session = await signInToGoogle();
      setEmail(session.email);
      setToken(session.accessToken);
      const { folderId } = archiveConfig();
      const next = await listDriveMedia(session.accessToken, folderId);
      setItems(next);
      rememberSession({ email: session.email, token: session.accessToken, items: next });
    } catch (err) {
      console.error(err);
      const code = err instanceof Error ? err.message : 'drive';
      setError(messageFor(code));
    } finally {
      setBusy(false);
    }
  };

  const leave = () => {
    haptic('light');
    signOutGoogle(token ?? undefined);
    setEmail(null);
    setToken(null);
    setItems([]);
    setViewer(null);
  };

  const openItem = async (item: DriveMedia) => {
    haptic('light');
    if (item.src && !item.src.includes('/preview')) {
      setViewer(item);
      return;
    }
    if (!token) return;
    setLoadingId(item.id);
    setError(null);
    try {
      const src = await fetchDriveFile(token, item.id);
      const loaded = { ...item, src };
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? loaded : entry)));
      setViewer(loaded);
    } catch (err) {
      console.error(err);
      if (item.kind === 'video') {
        setViewer({ ...item, src: `https://drive.google.com/file/d/${item.id}/preview` });
        return;
      }
      setError('No se ha podido abrir el archivo.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section>
      {!configured && (
        <p className="rounded-2xl border border-paper/10 px-4 py-4 text-[14px] leading-relaxed text-paper/45">
          Aún no está conectado. Falta el acceso de Google.
        </p>
      )}

      {configured && !email && !restoring && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void enter()}
          className="w-full rounded-full border border-gold/40 bg-gold/10 py-3.5 text-[12px] uppercase tracking-[0.2em] text-gold disabled:opacity-50"
        >
          {busy ? 'Abriendo Google…' : 'Entrar con Google'}
        </button>
      )}

      {(busy || restoring) && !email && (
        <p className="text-[13px] text-paper/40">Recuperando la sesión…</p>
      )}

      {email && (
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[12px] text-paper/45">{email}</p>
          <button
            type="button"
            onClick={leave}
            className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-paper/50"
          >
            salir
          </button>
        </div>
      )}

      {error && <p className="mt-5 text-[14px] leading-relaxed text-dust">{error}</p>}

      {email && !error && items.length === 0 && !busy && (
        <p className="mt-5 text-[14px] leading-relaxed text-paper/45">No hay nada en la carpeta.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-5 grid grid-cols-4 gap-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => void openItem(item)}
                className="relative block w-full overflow-hidden rounded-xl border border-paper/10"
              >
                <MediaThumb item={item} />
                {item.kind === 'video' && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/20">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/55 ring-1 ring-gold/50">
                      <span className="ml-px border-y-[4px] border-l-[7px] border-y-transparent border-l-gold" />
                    </span>
                  </span>
                )}
                {loadingId === item.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-[11px] uppercase tracking-[0.18em] text-paper/80">
                    cargando
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewer?.src && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/92 px-4"
          onClick={() => setViewer(null)}
        >
          {viewer.kind === 'video' && viewer.src.includes('/preview') ? (
            <iframe
              title={viewer.name}
              src={viewer.src}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="h-[70vh] w-full max-w-[52rem] rounded-2xl border-0 bg-ink"
              onClick={(e) => e.stopPropagation()}
            />
          ) : viewer.kind === 'video' ? (
            <video
              src={viewer.src}
              controls
              autoPlay
              playsInline
              className="max-h-[86vh] max-w-full rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={viewer.src}
              alt=""
              className="max-h-[86vh] max-w-full rounded-2xl object-contain"
              onError={(e) => {
                if (viewer.thumb && e.currentTarget.src !== viewer.thumb) {
                  e.currentTarget.src = viewer.thumb;
                }
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}

function MediaThumb({ item }: { item: DriveMedia }) {
  const candidates = [item.thumb, item.src].filter((src): src is string => Boolean(src) && !src.includes('/preview'));
  const [index, setIndex] = useState(0);
  const preview = candidates[index];

  if (preview) {
    return (
      <img
        src={preview}
        alt=""
        referrerPolicy="no-referrer"
        className="aspect-square w-full object-cover"
        onError={() => setIndex((i) => i + 1)}
      />
    );
  }

  return (
    <div
      className="flex aspect-square w-full flex-col items-center justify-center px-3"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(232,184,109,0.16), rgba(28,23,20,0.95) 62%)',
      }}
    >
      {item.kind === 'video' ? (
        <span className="font-display text-[11px] uppercase tracking-[0.22em] text-gold/80">vídeo</span>
      ) : (
        <span className="font-display text-[11px] uppercase tracking-[0.22em] text-paper/40">foto</span>
      )}
      <p className="mt-2 line-clamp-2 text-center text-[12px] leading-snug text-paper/55">{item.name}</p>
    </div>
  );
}

function messageFor(code: string) {
  if (code === 'forbidden') return 'Esta cuenta no tiene acceso. Tiene que ser la que está en la carpeta.';
  if (code === 'denied') return 'No se completó el acceso.';
  if (code === 'expired') return 'La sesión se ha caducado. Entra otra vez.';
  return 'No se han podido abrir los recuerdos.';
}
