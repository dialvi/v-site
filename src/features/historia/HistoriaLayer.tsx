import { useEffect, useRef, useState, type RefObject } from 'react';
import { storyBeats, type StoryBeat, type StoryDetail } from '@/content/story';
import { encodeStoryFocus, parseStoryFocus, placeForSlide } from '@/content/places';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { pingHistoriaLeave, pingHistoriaMap, pingHistoriaMove, pingHistoriaOpen } from '@/lib/watch';

type Props = {
  onBack: () => void;
  backLabel?: string;
  focusId?: string;
  onOpenMap?: (placeId: string, storyFocus: string) => void;
};

function snapAxis(
  el: HTMLElement,
  axis: 'x' | 'y',
  startScroll: number,
  velocity: number,
) {
  const size = axis === 'x' ? el.clientWidth : el.clientHeight;
  const max = Math.max(
    0,
    Math.round((axis === 'x' ? el.scrollWidth : el.scrollHeight) / size) - 1,
  );
  const startPage = Math.round(startScroll / size);
  const moved = (axis === 'x' ? el.scrollLeft : el.scrollTop) - startScroll;
  const threshold = size * 0.12;
  const flick = 0.28;

  let page = startPage;
  if (moved > threshold || velocity > flick) page = startPage + 1;
  else if (moved < -threshold || velocity < -flick) page = startPage - 1;

  page = Math.max(0, Math.min(max, page));
  const dest = page * size;
  if (axis === 'x') el.scrollTo({ left: dest, behavior: 'smooth' });
  else el.scrollTo({ top: dest, behavior: 'smooth' });
}

export function HistoriaLayer({ onBack, backLabel, focusId, onOpenMap }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const { beatIndex: start, depth: startDepth } = parseStoryFocus(focusId);
  const [index, setIndex] = useState(start);
  const cursor = useRef({ beat: start, depth: startDepth, at: Date.now() });
  const opened = useRef(false);
  const left = useRef(false);

  const moveTo = (beat: number, depth: number) => {
    const c = cursor.current;
    if (c.beat === beat && c.depth === depth) return;
    if (opened.current) {
      pingHistoriaMove(c.beat, c.depth, beat, depth, Math.round((Date.now() - c.at) / 1000));
    }
    cursor.current = { beat, depth, at: Date.now() };
  };

  const finish = () => {
    if (left.current) return;
    left.current = true;
    const c = cursor.current;
    pingHistoriaLeave(c.beat, c.depth, Math.round((Date.now() - c.at) / 1000));
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollLeft = start * el.clientWidth;
    });
    return () => cancelAnimationFrame(id);
  }, [start]);

  useEffect(() => {
    pingHistoriaOpen(start, startDepth);
    opened.current = true;
    cursor.current = { beat: start, depth: startDepth, at: Date.now() };
    return () => {
      finish();
    };
  }, [start, startDepth]);

  const leave = () => {
    finish();
    onBack();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/88 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip onClick={leave} label={backLabel} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Historia</p>
      </header>

      <div
        ref={scroller}
        className="historia-x flex min-h-0 flex-1"
        onScroll={(e) => {
          const el = e.currentTarget;
          const next = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (next !== index) setIndex(next);
        }}
      >
        {storyBeats.map((beat, i) => (
          <BeatColumn
            key={beat.id}
            beat={beat}
            isLast={i === storyBeats.length - 1}
            horizontal={scroller}
            restoreDepth={i === start ? startDepth : 0}
            active={i === index}
            onDepth={(depth) => moveTo(i, depth)}
            onOpenMap={
              onOpenMap
                ? (placeId, storyFocus) => {
                    pingHistoriaMap(i, cursor.current.beat === i ? cursor.current.depth : 0);
                    onOpenMap(placeId, storyFocus);
                  }
                : undefined
            }
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center gap-1.5 pb-[calc(var(--safe-bottom)+1.1rem)]">
        {storyBeats.map((beat, i) => (
          <span
            key={beat.id}
            className={[
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-5 bg-gold' : 'w-1.5 bg-paper/25',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}

function BeatColumn({
  beat,
  isLast,
  horizontal,
  restoreDepth,
  active,
  onDepth,
  onOpenMap,
}: {
  beat: StoryBeat;
  isLast: boolean;
  horizontal: RefObject<HTMLDivElement>;
  restoreDepth: number;
  active: boolean;
  onDepth: (depth: number) => void;
  onOpenMap?: (placeId: string, storyFocus: string) => void;
}) {
  const vertical = useRef<HTMLDivElement>(null);
  const [depth, setDepth] = useState(restoreDepth);
  const slides = beat.details.length;

  useEffect(() => {
    if (active) onDepth(depth);
  }, [active, depth, onDepth]);

  useEffect(() => {
    const v = vertical.current;
    const h = horizontal.current;
    if (!v || !h) return;

    const g = {
      x: 0,
      y: 0,
      sl: 0,
      st: 0,
      lx: 0,
      ly: 0,
      lt: 0,
      vx: 0,
      vy: 0,
      axis: null as null | 'x' | 'y',
    };

    const down = (e: TouchEvent) => {
      const t = e.touches[0];
      g.x = t.clientX;
      g.y = t.clientY;
      g.lx = t.clientX;
      g.ly = t.clientY;
      g.lt = e.timeStamp;
      g.sl = h.scrollLeft;
      g.st = v.scrollTop;
      g.vx = 0;
      g.vy = 0;
      g.axis = null;
    };

    const move = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = t.clientX - g.x;
      const dy = t.clientY - g.y;
      const dt = Math.max(8, e.timeStamp - g.lt);
      g.vx = (t.clientX - g.lx) / dt;
      g.vy = (t.clientY - g.ly) / dt;
      g.lx = t.clientX;
      g.ly = t.clientY;
      g.lt = e.timeStamp;
      if (!g.axis) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      e.preventDefault();
      if (g.axis === 'x') h.scrollLeft = g.sl - dx;
      else v.scrollTop = g.st - dy;
    };

    const up = () => {
      if (g.axis === 'x') snapAxis(h, 'x', g.sl, -g.vx);
      if (g.axis === 'y') snapAxis(v, 'y', g.st, -g.vy);
      g.axis = null;
    };

    v.addEventListener('touchstart', down, { passive: true });
    v.addEventListener('touchmove', move, { passive: false });
    v.addEventListener('touchend', up);
    v.addEventListener('touchcancel', up);
    return () => {
      v.removeEventListener('touchstart', down);
      v.removeEventListener('touchmove', move);
      v.removeEventListener('touchend', up);
      v.removeEventListener('touchcancel', up);
    };
  }, [horizontal]);

  useEffect(() => {
    const v = vertical.current;
    if (!v || restoreDepth < 1) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        v.scrollTop = restoreDepth * v.clientHeight;
        setDepth(restoreDepth);
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [restoreDepth]);

  const coverPlace = placeForSlide(beat.id, 0);

  return (
    <div className="relative h-full w-full shrink-0" style={{ flexBasis: '100%' }}>
      <div
        ref={vertical}
        className="historia-y h-full"
        onScroll={(e) => {
          const el = e.currentTarget;
          const next = Math.round(el.scrollTop / Math.max(1, el.clientHeight));
          if (next !== depth) setDepth(next);
        }}
      >
        <section className="flex h-full min-h-full shrink-0 flex-col px-6 pb-[calc(var(--safe-bottom)+4.5rem)] pt-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">
            {beat.index} · {beat.emoji}
          </p>
          <h2 className="mt-3 font-display text-[2.15rem] italic leading-none text-paper">{beat.title}</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-paper/80">{beat.lead}</p>
          {beat.quote && (
            <p className="selectable mt-6 border-l border-gold/40 pl-4 font-display text-[1.15rem] italic leading-snug text-paper/70">
              “{beat.quote}”
            </p>
          )}
          {beat.note && (
            <p className="selectable mt-5 text-[15px] leading-relaxed text-paper/70">{beat.note}</p>
          )}
          {beat.image && <MediaFrame kind="foto" src={beat.image} />}
          {beat.audio && <AudioSlot src={beat.audio} />}
          {coverPlace && onOpenMap && (
            <MapJump
              placeId={coverPlace.id}
              storyFocus={encodeStoryFocus(beat.id, 0)}
              onOpenMap={onOpenMap}
            />
          )}
          <p className="mt-auto pt-8 text-[11px] uppercase tracking-[0.22em] text-paper/30">
            desliza ↓{!isLast ? '  ·  →' : ''}
          </p>
        </section>

        {beat.details.map((detail, i) => (
          <DetailSlide
            key={`${beat.id}-${i}`}
            beat={beat}
            detail={detail}
            depth={i + 1}
            last={i === slides - 1}
            showSide={!isLast && i === slides - 1}
            onOpenMap={onOpenMap}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
        {Array.from({ length: slides + 1 }, (_, i) => (
          <span
            key={i}
            className={[
              'w-1.5 rounded-full transition-all',
              i === depth ? 'h-5 bg-gold' : 'h-1.5 bg-paper/25',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}

function DetailSlide({
  beat,
  detail,
  depth,
  last,
  showSide,
  onOpenMap,
}: {
  beat: StoryBeat;
  detail: StoryDetail;
  depth: number;
  last: boolean;
  showSide: boolean;
  onOpenMap?: (placeId: string, storyFocus: string) => void;
}) {
  const place = placeForSlide(beat.id, depth);
  return (
    <section className="flex h-full min-h-full shrink-0 flex-col px-6 pb-[calc(var(--safe-bottom)+4.5rem)] pt-2">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">
        {beat.index}.{detail.kicker ?? ''} · {beat.emoji}
      </p>
      <h2 className="mt-3 font-display text-[2.05rem] italic leading-[1.05] text-paper">{detail.title}</h2>
      {detail.body && (
        <p className="selectable mt-6 text-[16px] leading-relaxed text-paper/75">{detail.body}</p>
      )}
      {place && onOpenMap && (
        <MapJump
          placeId={place.id}
          storyFocus={encodeStoryFocus(beat.id, depth)}
          onOpenMap={onOpenMap}
        />
      )}
      {last && showSide ? (
        <p className="mt-auto pt-8 font-display text-[2.15rem] italic leading-none text-gold/90">
          desliza →
        </p>
      ) : (
        <p className="mt-auto pt-8 text-[11px] uppercase tracking-[0.22em] text-paper/30">
          {last ? '' : 'desliza ↓'}
        </p>
      )}
    </section>
  );
}

function MapJump({
  placeId,
  storyFocus,
  onOpenMap,
}: {
  placeId: string;
  storyFocus: string;
  onOpenMap: (placeId: string, storyFocus: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic('medium');
        onOpenMap(placeId, storyFocus);
      }}
      className="mt-8 w-full rounded-full border border-[#e23a32]/50 bg-[#e23a32]/10 py-3.5 text-[12px] uppercase tracking-[0.2em] text-[#e23a32]"
    >
      Ver en el mapa →
    </button>
  );
}

function MediaFrame({ kind, src }: { kind: string; src: string }) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-paper/10 bg-night">
      <img
        src={src}
        alt=""
        className="hidden max-h-64 w-full object-cover"
        onLoad={(e) => {
          e.currentTarget.classList.remove('hidden');
          e.currentTarget.nextElementSibling?.classList.add('hidden');
        }}
      />
      <div className="flex h-40 items-center justify-center text-[12px] uppercase tracking-[0.24em] text-paper/35">
        {kind} · pendiente
      </div>
    </div>
  );
}

function AudioSlot({ src }: { src: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-paper/10 bg-night/80 px-4 py-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-paper/40">audio</p>
      <audio controls preload="none" src={src} className="w-full">
        Tu navegador no puede reproducir el audio.
      </audio>
    </div>
  );
}
