import { useEffect, useRef, useState } from 'react';
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
  const [index, setIndex] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(Boolean(configured && !live));
  const viewer = index !== null ? items[index] ?? null : null;

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
    setIndex(null);
  };

  const openAt = async (at: number) => {
    if (!items.length) return;
    const next = ((at % items.length) + items.length) % items.length;
    const item = items[next];
    haptic('light');
    setIndex(next);
    if (item.src && !item.src.includes('/preview')) return;
    if (!token) return;
    setLoadingId(item.id);
    setError(null);
    try {
      const src = await fetchDriveFile(token, item.id);
      const loaded = { ...item, src };
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? loaded : entry)));
    } catch (err) {
      console.error(err);
      if (item.kind === 'video') {
        const loaded = { ...item, src: `https://drive.google.com/file/d/${item.id}/preview` };
        setItems((prev) => prev.map((entry) => (entry.id === item.id ? loaded : entry)));
        return;
      }
      setError('No se ha podido abrir el archivo.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section>
      <p className="mb-6 font-display text-[1.45rem] italic leading-tight text-paper/80">
        Para que los planecitos no llenen tu iCloud
      </p>
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
                onClick={() => void openAt(items.findIndex((entry) => entry.id === item.id))}
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

      {viewer && index !== null && (
        <MediaViewer
          item={viewer}
          index={index}
          total={items.length}
          loading={loadingId === viewer.id}
          onClose={() => setIndex(null)}
          onPrev={() => void openAt(index - 1)}
          onNext={() => void openAt(index + 1)}
        />
      )}
    </section>
  );
}

function MediaViewer({
  item,
  index,
  total,
  loading,
  onClose,
  onPrev,
  onNext,
}: {
  item: DriveMedia;
  index: number;
  total: number;
  loading: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState(0);
  const src = item.src;
  const preview = src && !src.includes('/preview') ? src : item.thumb;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const finish = (e: { clientX: number; clientY: number; target: EventTarget | null }) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    setDrag(0);
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onNext();
      else onPrev();
      return;
    }
    const el = e.target as HTMLElement | null;
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && el && !el.closest('img, video, iframe, button')) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex touch-none flex-col bg-ink/92"
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        start.current = { x: e.clientX, y: e.clientY };
        setDrag(0);
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        setDrag(e.clientX - start.current.x);
      }}
      onPointerUp={(e) => finish(e)}
      onPointerCancel={() => {
        start.current = null;
        setDrag(0);
      }}
    >
      <div className="safe-pad flex items-center justify-between">
        <button
          type="button"
          className="rounded-full border border-paper/15 bg-ink/55 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-paper/75"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          cerrar
        </button>
        <p className="text-[11px] uppercase tracking-[0.22em] text-paper/45">
          {index + 1} / {total}
        </p>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-[calc(var(--safe-bottom)+1.5rem)]">
        <div
          className="flex max-h-full max-w-full items-center justify-center"
          style={{ transform: `translateX(${drag * 0.35}px)` }}
        >
          {item.kind === 'video' && src?.includes('/preview') ? (
            <iframe
              title={item.name}
              src={src}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="pointer-events-none h-[70vh] w-[min(100%,52rem)] rounded-2xl border-0 bg-ink"
            />
          ) : item.kind === 'video' && src ? (
            <video
              src={src}
              controls
              autoPlay
              playsInline
              className="max-h-[78vh] max-w-full rounded-2xl"
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : preview ? (
            <img
              src={preview}
              alt=""
              className="max-h-[78vh] max-w-full rounded-2xl object-contain"
              onError={(e) => {
                if (item.thumb && e.currentTarget.src !== item.thumb) e.currentTarget.src = item.thumb;
              }}
            />
          ) : (
            <p className="text-[13px] uppercase tracking-[0.18em] text-paper/40">cargando</p>
          )}
        </div>

        {loading && (
          <p className="pointer-events-none absolute bottom-8 text-[11px] uppercase tracking-[0.18em] text-paper/50">
            cargando
          </p>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              className="absolute left-0 top-0 h-full w-[22%] max-w-[6rem]"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Siguiente"
              className="absolute right-0 top-0 h-full w-[22%] max-w-[6rem]"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </>
        )}
      </div>
    </div>
  );
}

function MediaThumb({ item }: { item: DriveMedia }) {
  const candidates = [item.thumb, item.src].filter(
    (src): src is string => typeof src === 'string' && !src.includes('/preview'),
  );
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
  if (code.startsWith('forbidden-email')) {
    const used = code.includes(':') ? code.slice(code.indexOf(':') + 1) : '';
    return used
      ? `Has entrado con ${used}. Esa Gmail no está en la lista del secret.`
      : 'Has entrado con una cuenta que no está en la lista. En Google elige la misma Gmail que en el PC.';
  }
  if (code === 'forbidden-folder' || code === 'forbidden') {
    return 'Google no deja leer la carpeta con esa cuenta. Compártela en Drive como lectora.';
  }
  if (code === 'missing-folder') return 'No se encuentra la carpeta. Revisa el ID en los secrets.';
  if (code === 'denied') return 'No se completó el acceso.';
  if (code === 'expired') return 'La sesión se ha caducado. Entra otra vez.';
  return 'No se han podido abrir los recuerdos.';
}
