import { useEffect, useRef, useState, type FormEvent, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { clamp } from '@/lib/motion';
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
import { duckUniverseTheme, ensureUniverseTheme } from '@/lib/universeTheme';
import { pingArchivoComment, pingArchivoEnter, pingArchivoLeave, pingArchivoLike, pingArchivoPhoto, pingArchivoPhotoClose } from '@/lib/watch';

type Props = {
  onBack: () => void;
};

const NOTES_KEY = 'v-album-notes';
const TILTS = [-2.6, 1.8, -1.2, 2.4, 0.6, -2.1, 1.5, -0.8];

type AlbumNotes = {
  likes: Record<string, boolean>;
  comments: Record<string, string[]>;
};

function loadNotes(): AlbumNotes {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return { likes: {}, comments: {} };
    const parsed = JSON.parse(raw) as AlbumNotes;
    return {
      likes: parsed.likes ?? {},
      comments: parsed.comments ?? {},
    };
  } catch {
    return { likes: {}, comments: {} };
  }
}

function saveNotes(notes: AlbumNotes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    /* private mode */
  }
}
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function ArchivoLayer({ onBack }: Props) {
  useEffect(() => {
    pingArchivoEnter();
    return () => pingArchivoLeave();
  }, []);

  const leave = () => {
    pingArchivoLeave();
    onBack();
  };

  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [looking, setLooking] = useState(false);
  const closer = useRef<() => void>(() => undefined);

  return (
    <div className="album-page z-20 animate-depth-in">
      <header className="relative z-30 flex shrink-0 items-center justify-between px-5 pb-2 pt-[calc(var(--safe-top)+1rem)]">
        <BackChip
          onClick={() => {
            if (looking) closer.current();
            else leave();
          }}
          label={looking ? 'cerrar' : 'universo'}
        />
        <p className="font-display text-[15px] italic text-paper/70">el álbum</p>
      </header>

      <div ref={setStage} className="relative min-h-0 flex-1">
        <div className="album-sheet px-6 pb-[calc(var(--safe-bottom)+3rem)]">
          <DriveVault stage={stage} onLooking={setLooking} closer={closer} />
        </div>
      </div>
    </div>
  );
}

function DriveVault({
  stage,
  onLooking,
  closer,
}: {
  stage: HTMLDivElement | null;
  onLooking: (open: boolean) => void;
  closer: MutableRefObject<() => void>;
}) {
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
  const loads = useRef(new Map<string, Promise<string | undefined>>());
  const viewer = index !== null ? items[index] ?? null : null;

  const playableSrc = (item?: DriveMedia) =>
    Boolean(item?.src && !item.src.includes('/preview'));

  const ensureSrc = (item: DriveMedia) => {
    if (playableSrc(item)) return Promise.resolve(item.src);
    if (!token) return Promise.resolve(undefined);
    const cached = loads.current.get(item.id);
    if (cached) return cached;
    const pending = fetchDriveFile(token, item.id)
      .then((src) => {
        setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, src } : entry)));
        return src;
      })
      .catch((err) => {
        console.error(err);
        if (item.kind === 'video') {
          const src = `https://drive.google.com/file/d/${item.id}/preview`;
          setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, src } : entry)));
          return src;
        }
        loads.current.delete(item.id);
        throw err;
      });
    loads.current.set(item.id, pending);
    return pending;
  };

  const preloadAround = (at: number) => {
    if (!items.length) return;
    const seen = new Set<string>([items[at]?.id]);
    for (const offset of [1, -1, 2]) {
      const item = items[((at + offset) % items.length + items.length) % items.length];
      if (!item || seen.has(item.id) || item.kind !== 'video' || playableSrc(item)) continue;
      seen.add(item.id);
      void ensureSrc(item).catch(() => undefined);
    }
  };

  useEffect(() => {
    onLooking(index !== null);
  }, [index, onLooking]);

  useEffect(() => {
    closer.current = () => {
      if (index === null) return;
      pingArchivoPhotoClose();
      duckUniverseTheme(false);
      ensureUniverseTheme();
      setIndex(null);
    };
  }, [closer, index]);

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
    preloadAround(next);
    if (playableSrc(item) || !token) return;
    setLoadingId(item.id);
    setError(null);
    try {
      await ensureSrc(item);
    } catch {
      setError('No se ha podido abrir el archivo.');
    } finally {
      setLoadingId((id) => (id === item.id ? null : id));
    }
  };

  const primed: string[] = [];
  if (index !== null && items.length > 1) {
    const seen = new Set<string>();
    for (const offset of [1, -1, 2]) {
      const neighbor = items[((index + offset) % items.length + items.length) % items.length];
      if (
        !neighbor ||
        neighbor.id === items[index]?.id ||
        neighbor.kind !== 'video' ||
        !playableSrc(neighbor) ||
        !neighbor.src ||
        seen.has(neighbor.src)
      ) {
        continue;
      }
      seen.add(neighbor.src);
      primed.push(neighbor.src);
    }
  }

  return (
    <section>
      <p className="mb-7 font-display text-[1.55rem] italic leading-tight text-paper/85">
        Para que los recuerdos no llenen tu iCloud
      </p>
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

      {viewer && index !== null && stage
        ? createPortal(
            <MediaViewer
              item={viewer}
              index={index}
              total={items.length}
              loading={loadingId === viewer.id}
              primed={primed}
              onClose={() => {
                pingArchivoPhotoClose();
                duckUniverseTheme(false);
                ensureUniverseTheme();
                setIndex(null);
              }}
              onPrev={() => void openAt(index - 1, 'anterior')}
              onNext={() => void openAt(index + 1, 'siguiente')}
            />,
            stage,
          )
        : null}
    </section>
  );
}

function MediaViewer({
  item,
  index,
  total,
  loading,
  primed,
  onClose,
  onPrev,
  onNext,
}: {
  item: DriveMedia;
  index: number;
  total: number;
  loading: boolean;
  primed: string[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef(0);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; s: number; x: number; y: number } | null>(null);
  const zoomRef = useRef({ s: 1, x: 0, y: 0 });
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [notes, setNotes] = useState(loadNotes);
  const src = item.src;
  const preview = src && !src.includes('/preview') ? src : item.thumb;
  const playable = Boolean(src && !src.includes('/preview'));
  const waiting = item.kind === 'video' && (loading || !playable || !ready);
  const key = String(index);
  const liked = Boolean(notes.likes[key]);
  const zoomed = zoom.s > 1.04;
  const videoSound = item.kind === 'video' && playable && !muted;

  const putZoom = (next: { s: number; x: number; y: number }) => {
    const s = clamp(next.s, MIN_ZOOM, MAX_ZOOM);
    const slack = (s - 1) * 280;
    const value = {
      s,
      x: s <= 1.02 ? 0 : clamp(next.x, -slack, slack),
      y: s <= 1.02 ? 0 : clamp(next.y, -slack, slack),
    };
    if (s <= 1.02) {
      value.s = 1;
      value.x = 0;
      value.y = 0;
    }
    zoomRef.current = value;
    setZoom(value);
  };

  useEffect(() => {
    setReady(false);
    setMuted(true);
    putZoom({ s: 1, x: 0, y: 0 });
  }, [item.id, src]);

  useEffect(() => {
    duckUniverseTheme(videoSound);
    ensureUniverseTheme();
    return () => {
      duckUniverseTheme(false);
      ensureUniverseTheme();
    };
  }, [videoSound, item.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const toggleLike = (next = !liked) => {
    const updated: AlbumNotes = {
      likes: { ...notes.likes },
      comments: notes.comments,
    };
    if (next) updated.likes[key] = true;
    else delete updated.likes[key];
    saveNotes(updated);
    setNotes(updated);
    pingArchivoLike(index, item.kind, next);
    haptic(next ? 'success' : 'light');
  };

  const addComment = (text: string) => {
    const updated: AlbumNotes = {
      likes: notes.likes,
      comments: {
        ...notes.comments,
        [key]: [...(notes.comments[key] ?? []), text],
      },
    };
    saveNotes(updated);
    setNotes(updated);
    pingArchivoComment(index, item.kind, text);
    haptic('light');
  };

  const finish = (e: { clientX: number; clientY: number; target: EventTarget | null }) => {
    if (pinch.current || zoomRef.current.s > 1.04) {
      start.current = null;
      setDrag({ x: 0, y: 0 });
      return;
    }
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    setDrag({ x: 0, y: 0 });
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onNext();
      else onPrev();
      return;
    }
    if (dy >= 72 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }
    const el = e.target as HTMLElement | null;
    if (Math.abs(dx) >= 8 || Math.abs(dy) >= 8) return;
    if (el?.closest('[data-skip]')) return;
    if (el?.closest('img, video')) {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        lastTap.current = 0;
        if (!liked) toggleLike(true);
        return;
      }
      lastTap.current = now;
      return;
    }
    if (el && !el.closest('img, video, iframe, button, input, form')) onClose();
  };

  const mediaStyle = {
    transform: `translate(${zoom.x + drag.x * (zoomed ? 0 : 0.4)}px, ${zoom.y + Math.max(0, drag.y) * (zoomed ? 0 : 0.35)}px) scale(${zoom.s})`,
    transformOrigin: 'center center',
    touchAction: 'none',
  } as const;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col bg-[#120e0a]/96"
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if ((e.target as HTMLElement | null)?.closest('button, input, form, textarea')) return;
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.current.size >= 2) {
          const [a, b] = [...pts.current.values()];
          pinch.current = {
            dist: Math.hypot(a.x - b.x, a.y - b.y),
            s: zoomRef.current.s,
            x: zoomRef.current.x,
            y: zoomRef.current.y,
          };
          start.current = null;
          setDrag({ x: 0, y: 0 });
          return;
        }
        start.current = { x: e.clientX, y: e.clientY };
        setDrag({ x: 0, y: 0 });
      }}
      onPointerMove={(e) => {
        if (!pts.current.has(e.pointerId)) return;
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch.current && pts.current.size >= 2) {
          const [a, b] = [...pts.current.values()];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinch.current.dist < 8) return;
          putZoom({
            s: pinch.current.s * (dist / pinch.current.dist),
            x: pinch.current.x,
            y: pinch.current.y,
          });
          return;
        }
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        if (zoomRef.current.s > 1.04) {
          putZoom({
            s: zoomRef.current.s,
            x: zoomRef.current.x + dx,
            y: zoomRef.current.y + dy,
          });
          start.current = { x: e.clientX, y: e.clientY };
          return;
        }
        setDrag({ x: dx, y: dy });
      }}
      onPointerUp={(e) => {
        pts.current.delete(e.pointerId);
        if (pts.current.size < 2) pinch.current = null;
        finish(e);
      }}
      onPointerCancel={(e) => {
        pts.current.delete(e.pointerId);
        pinch.current = null;
        start.current = null;
        setDrag({ x: 0, y: 0 });
      }}
      onWheel={(e) => {
        if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return;
        e.preventDefault();
        const next = zoomRef.current.s * (e.deltaY > 0 ? 0.92 : 1.08);
        putZoom({ s: next, x: zoomRef.current.x, y: zoomRef.current.y });
      }}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {item.kind === 'video' && src?.includes('/preview') && !loading ? (
          <iframe
            title={item.name}
            src={src}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="h-[88%] w-[min(100%,42rem)] border-0 bg-ink"
          />
        ) : item.kind === 'video' ? (
          <>
            {playable && (
              <video
                src={src}
                controls={!zoomed}
                autoPlay
                muted={muted}
                playsInline
                preload="auto"
                className={
                  ready
                    ? 'max-h-full max-w-full'
                    : 'pointer-events-none absolute h-px w-px opacity-0'
                }
                style={ready ? mediaStyle : undefined}
                onCanPlay={() => setReady(true)}
                onPlaying={() => {
                  setReady(true);
                  ensureUniverseTheme();
                }}
                onPlay={() => ensureUniverseTheme()}
                onPause={() => ensureUniverseTheme()}
                onEnded={() => {
                  setMuted(true);
                  duckUniverseTheme(false);
                  ensureUniverseTheme();
                }}
                onVolumeChange={(e) => {
                  const el = e.currentTarget;
                  const silent = el.muted || el.volume === 0;
                  setMuted(silent);
                  duckUniverseTheme(!silent);
                  ensureUniverseTheme();
                }}
              />
            )}
            {primed.map((url) => (
              <video
                key={url}
                src={url}
                preload="auto"
                muted
                playsInline
                className="pointer-events-none absolute h-px w-px opacity-0"
              />
            ))}
            {waiting && <MediaWait kind="video" poster={item.thumb} />}
            {playable && ready && (
              <button
                type="button"
                data-skip="1"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  haptic('light');
                  setMuted((on) => {
                    const next = !on;
                    duckUniverseTheme(!next);
                    ensureUniverseTheme();
                    return next;
                  });
                }}
                className="absolute left-3 top-3 z-20 rounded-full border border-paper/20 bg-ink/70 px-3 py-1.5 font-display text-[12px] italic text-paper/80"
              >
                {muted ? 'sin sonido' : 'sonido on'}
              </button>
            )}
          </>
        ) : preview ? (
          <img
            src={preview}
            alt=""
            className="max-h-full max-w-full object-contain will-change-transform"
            style={mediaStyle}
            onError={(e) => {
              if (item.thumb && e.currentTarget.src !== item.thumb) e.currentTarget.src = item.thumb;
            }}
          />
        ) : (
          <MediaWait kind="image" />
        )}
        {total > 1 && !zoomed && (
          <>
            <button
              type="button"
              data-skip="1"
              aria-label="Anterior"
              className="absolute inset-y-0 left-0 z-10 flex w-[22%] max-w-[5.5rem] items-center justify-start pl-2"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
            >
              <span className="font-display text-[2.2rem] leading-none text-paper/45">‹</span>
            </button>
            <button
              type="button"
              data-skip="1"
              aria-label="Siguiente"
              className="absolute inset-y-0 right-0 z-10 flex w-[22%] max-w-[5.5rem] items-center justify-end pr-2"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              <span className="font-display text-[2.2rem] leading-none text-paper/45">›</span>
            </button>
          </>
        )}
      </div>
      <MediaSocial
        index={index}
        total={total}
        liked={liked}
        comments={notes.comments[key] ?? []}
        onLike={() => toggleLike()}
        onComment={addComment}
      />
    </div>
  );
}

function MediaSocial({
  index,
  total,
  liked,
  comments,
  onLike,
  onComment,
}: {
  index: number;
  total: number;
  liked: boolean;
  comments: string[];
  onLike: () => void;
  onComment: (text: string) => void;
}) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText('');
  }, [index]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onComment(value);
    setText('');
  };

  return (
    <div
      className="shrink-0 border-t border-paper/10 bg-[#1a1410]/95 px-4 pb-[calc(var(--safe-bottom)+0.75rem)] pt-3"
      style={{ touchAction: 'auto' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={liked ? 'Quitar like' : 'Like'}
          onClick={onLike}
          className={`text-[1.85rem] leading-none ${liked ? 'text-gold' : 'text-paper/70'}`}
        >
          {liked ? '♥' : '♡'}
        </button>
        <p className="font-display text-[13px] italic text-paper/40">
          {index + 1} / {total}
        </p>
      </div>
      {comments.length > 0 && (
        <ul className="mt-2 max-h-20 space-y-1 overflow-y-auto">
          {comments.slice(-4).map((comment, i) => (
            <li key={`${comment}-${i}`} className="text-[13px] leading-snug text-paper/75">
              <span className="font-display italic text-gold/80">tú </span>
              {comment}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={send} className="mt-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario…"
          maxLength={280}
          className="selectable min-w-0 flex-1 rounded-full border border-paper/15 bg-paper/10 px-4 py-2.5 text-[14px] text-paper outline-none placeholder:text-paper/35"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="shrink-0 font-display text-[14px] italic text-gold disabled:text-paper/25"
        >
          enviar
        </button>
      </form>
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
