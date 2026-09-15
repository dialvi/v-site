import { useRef } from 'react';

type Props = {
  x: number;
  y: number;
  label: string;
  kicker: string;
  glyph: string;
  visible: boolean;
  delay?: number;
  onOpen: () => void;
};

export function WorldNode({ x, y, label, kicker, glyph, visible, delay = 0, onOpen }: Props) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        origin.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        const o = origin.current;
        if (o && Math.hypot(e.clientX - o.x, e.clientY - o.y) > 12) return;
        onOpen();
      }}
      disabled={!visible}
      className="absolute flex h-[220px] w-[250px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-2 text-center transition-opacity duration-700"
      style={{
        left: x,
        top: y,
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <span className="relative mb-3 flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-gold/10 blur-md" />
        <span className="relative text-3xl" aria-hidden>
          {glyph}
        </span>
      </span>
      <span className="text-[10px] uppercase tracking-[0.28em] text-gold/70">{kicker}</span>
      <span className="mt-1 max-w-[14ch] font-display text-[1.35rem] italic leading-[1.05] text-paper">{label}</span>
    </button>
  );
}
