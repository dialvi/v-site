import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { pingArchivoEnter, pingArchivoLeave, pingArchivoPhoto, pingArchivoPhotoClose } from '@/lib/watch';

type Props = {
  onBack: () => void;
};

const TILTS = [-2.6, 1.8, -1.2, 2.4, 0.6, -2.1, 1.5, -0.8];

export function ArchivoLayer({ onBack }: Props) {
  useEffect(() => {
    pingArchivoEnter();
    return () => pingArchivoLeave();
  }, []);

  const leave = () => {
    pingArchivoLeave();
    onBack();
  };

  return (
    <div className="album-page z-20 animate-depth-in">
      <header className="relative z-[1] flex shrink-0 items-center justify-between px-5 pb-2 pt-[calc(var(--safe-top)+1rem)]">
        <BackChip onClick={leave} label="universo" />
        <p className="font-display text-[15px] italic text-paper/70">el álbum</p>
      </header>

      <div className="album-sheet px-6 pb-[calc(var(--safe-bottom)+3rem)]">
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

  const openAt = async (at: number, how: 'click' | 'siguiente' | 'anterior') => {
    if (!items.length) return;
    const next = ((at % items.length) + items.length) % items.length;
    const item = items[next];
    haptic('light');
    pingArchivoPhoto(how, next, item.kind);
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
      <p className="mb-1 font-display text-[1.55rem] italic leading-tight text-paper/85">
        Para que los recuerdos no llenen tu iCloud
      </p>
      <p className="mb-7 font-display text-[13px] italic text-dust/75">pegadas aquí, una al lado de la otra</p>
      {!configured && (
        <p className="rounded-sm border border-dashed border-paper/20 bg-paper/5 px-4 py-4 text-[14px] leading-relaxed text-paper/55">
          Aún no está conectado. Falta el acceso de Google.
        </p>
      )}

      {configured && !email && !restoring && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void enter()}
          className="album-label disabled:opacity-50"
        >
          {busy ? 'Abriendo Google…' : 'Abrir el álbum'}
        </button>
      )}

      {(busy || restoring) && !email && (
        <p className="font-display text-[14px] italic text-paper/45">Buscando las fotos…</p>
      )}

      {email && (
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[12px] text-paper/40">{email}</p>
          <button
            type="button"
            onClick={leave}
            className="shrink-0 font-display text-[12px] italic text-paper/50"
          >
            cerrar álbum
          </button>
        </div>
      )}

      {error && <p className="mt-5 text-[14px] leading-relaxed text-dust">{error}</p>}

      {email && !error && items.length === 0 && !busy && (
        <p className="mt-5 font-display text-[15px] italic text-paper/50">Este álbum todavía está vacío.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 px-2 pt-3">
          {items.map((item, i) => (
            <li key={item.id} className="overflow-visible">
              <button
                type="button"
                onClick={() =>
                  void openAt(
                    items.findIndex((entry) => entry.id === item.id),
                    'click',
                  )
                }
                className="album-polaroid"
                style={{ ['--tilt' as string]: `${TILTS[i % TILTS.length]}deg` }}
              >
                {i % 3 === 0 && <i className="album-tape album-tape-l" />}
                {i % 3 === 2 && <i className="album-tape album-tape-r" />}
                <span className="album-shot">
                  <MediaThumb item={item} />
                  {item.kind === 'video' && loadingId !== item.id && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/20">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/55 ring-1 ring-gold/50">
                        <span className="ml-px border-y-[4px] border-l-[7px] border-y-transparent border-l-gold" />
                      </span>
                    </span>
                  )}
                  {loadingId === item.id && <MediaWait compact kind={item.kind} />}
                </span>
                <span className="album-caption">{item.kind === 'video' ? 'vídeo' : '\u00a0'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewer && index !== null &&
        createPortal(
          <MediaViewer
            item={viewer}
            index={index}
            total={items.length}
            loading={loadingId === viewer.id}
            onClose={() => {
              pingArchivoPhotoClose();
              setIndex(null);
            }}
            onPrev={() => void openAt(index - 1, 'anterior')}
            onNext={() => void openAt(index + 1, 'siguiente')}
          />,
          document.body,
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
  const [ready, setReady] = useState(false);
  const src = item.src;
  const preview = src && !src.includes('/preview') ? src : item.thumb;
  const playable = Boolean(src && !src.includes('/preview'));
  const waiting = item.kind === 'video' && (loading || !playable || !ready);

  useEffect(() => {
    setReady(false);
  }, [item.id, src]);

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
      className="fixed inset-0 z-[80] bg-[#120e0a]/94"
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
      <div className="flex h-full w-full items-center justify-center px-5">
        <div
          className="album-polaroid album-polaroid-lg"
          style={{
            translate: `${drag * 0.35}px 0`,
            ['--tilt' as string]: `${index % 2 === 0 ? -1.2 : 1.1}deg`,
          }}
        >
          <span className="album-shot">
            {item.kind === 'video' && src?.includes('/preview') && !loading ? (
              <iframe
                title={item.name}
                src={src}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="pointer-events-none w-[min(100%,22rem)] border-0 bg-ink"
              />
            ) : item.kind === 'video' ? (
              <>
                {playable && (
                  <video
                    src={src}
                    controls
                    autoPlay
                    playsInline
                  className={
                    ready
                      ? 'max-h-[min(58vh,28rem)] max-w-full'
                      : 'pointer-events-none absolute h-px w-px opacity-0'
                  }
                    onCanPlay={() => setReady(true)}
                    onPlaying={() => setReady(true)}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                )}
                {waiting && <MediaWait kind="video" poster={item.thumb} />}
              </>
            ) : preview ? (
              <img
                src={preview}
                alt=""
                onError={(e) => {
                  if (item.thumb && e.currentTarget.src !== item.thumb) e.currentTarget.src = item.thumb;
                }}
              />
            ) : (
              <MediaWait kind="image" />
            )}
          </span>
          <p className="album-caption">{item.kind === 'video' ? 'vídeo' : '\u00a0'}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-[calc(var(--safe-top)+1rem)]">
        <button
          type="button"
          className="pointer-events-auto rounded-full border border-paper/15 bg-ink/55 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-paper/75"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          cerrar
        </button>
        <p className="font-display text-[14px] italic text-paper/55">{index + 1} / {total}</p>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            className="absolute left-0 top-0 z-[1] h-full w-[22%] max-w-[6rem]"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Siguiente"
            className="absolute right-0 top-0 z-[1] h-full w-[22%] max-w-[6rem]"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        </>
      )}
    </div>
  );
}

function MediaWait({
  kind,
  compact,
  poster,
}: {
  kind: 'image' | 'video';
  compact?: boolean;
  poster?: string;
}) {
  const video = kind === 'video';
  if (compact) {
    return (
      <span className="absolute inset-0 flex flex-col items-center justify-center bg-ink/75">
        <span className="relative flex h-8 w-8 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          {video && (
            <span className="ml-px border-y-[4px] border-l-[7px] border-y-transparent border-l-gold" />
          )}
        </span>
        <span className="mt-1.5 font-display text-[10px] italic text-gold">
          {video ? 'vídeo' : 'foto'}
        </span>
      </span>
    );
  }

  return (
    <div className="relative flex min-h-[12rem] w-full items-center justify-center overflow-hidden bg-[#2a2218]">
      {poster && (
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      )}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
          <span className="absolute inset-0 rounded-full border-[3px] border-gold/25 border-t-gold animate-spin" />
          {video && (
            <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-gold" />
          )}
        </span>
        <p className="mt-5 font-display text-[1.8rem] italic leading-none text-paper">
          {video ? 'Vídeo' : 'Foto'}
        </p>
        <p className="mt-3 font-display text-[13px] italic text-gold">revelando…</p>
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
        background: 'linear-gradient(180deg, #d8c7a8, #c4b08a)',
      }}
    >
      {item.kind === 'video' ? (
        <span className="font-display text-[12px] italic text-[#6b5340]">vídeo</span>
      ) : (
        <span className="font-display text-[12px] italic text-[#6b5340]/70">foto</span>
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
