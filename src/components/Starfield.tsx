import { useMemo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Star = { x: number; y: number; r: number; o: number; d: number };

type Planet = {
  cx: string;
  cy: string;
  rx: number;
  ry: number;
  size: number;
  duration: number;
  delay: number;
  fill: string;
  glow: string;
  ring?: boolean;
};

type Floater = {
  emoji: string;
  cx: string;
  cy: string;
  rx: number;
  ry: number;
  size: number;
  duration: number;
  delay: number;
};

const planets: Planet[] = [
  {
    cx: '16%',
    cy: '78%',
    rx: 150,
    ry: 118,
    size: 11,
    duration: 52,
    delay: -18,
    fill: 'radial-gradient(circle at 32% 30%, #f0d2b0 0%, #c9a08a 45%, #5c3c32 100%)',
    glow: 'rgba(201, 160, 138, 0.4)',
  },
  {
    cx: '82%',
    cy: '20%',
    rx: 190,
    ry: 154,
    size: 18,
    duration: 78,
    delay: -40,
    fill: 'radial-gradient(circle at 30% 28%, #f8e2b0 0%, #e8b86d 40%, #7a4a20 100%)',
    glow: 'rgba(232, 184, 109, 0.45)',
    ring: true,
  },
  {
    cx: '72%',
    cy: '84%',
    rx: 120,
    ry: 96,
    size: 9,
    duration: 38,
    delay: -8,
    fill: 'radial-gradient(circle at 35% 32%, #d8c4b8 0%, #8a6a62 50%, #3a2824 100%)',
    glow: 'rgba(180, 140, 120, 0.32)',
  },
  {
    cx: '22%',
    cy: '18%',
    rx: 210,
    ry: 168,
    size: 14,
    duration: 96,
    delay: -55,
    fill: 'radial-gradient(circle at 34% 30%, #c8d0dc 0%, #6a788c 48%, #2a303c 100%)',
    glow: 'rgba(140, 160, 180, 0.32)',
  },
];

const floaters: Floater[] = [
  {
    emoji: '🐐',
    cx: '38%',
    cy: '42%',
    rx: 210,
    ry: 168,
    size: 22,
    duration: 58,
    delay: -14,
  },
  {
    emoji: '🇲🇽',
    cx: '68%',
    cy: '58%',
    rx: 170,
    ry: 140,
    size: 20,
    duration: 44,
    delay: -26,
  },
];

const shoots = [
  { top: '12%', left: '-8%', delay: 0, duration: 11, length: 92 },
  { top: '38%', left: '18%', delay: 4.2, duration: 13, length: 78 },
  { top: '8%', left: '48%', delay: 8.6, duration: 12, length: 110 },
  { top: '58%', left: '-4%', delay: 14, duration: 15, length: 86 },
];

export function Starfield() {
  const reduced = usePrefersReducedMotion();
  const stars = useMemo<Star[]>(() => {
    const out: Star[] = [];
    for (let i = 0; i < 90; i += 1) {
      out.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 1.4 + 0.3,
        o: Math.random() * 0.55 + 0.15,
        d: 4 + Math.random() * 8,
      });
    }
    return out;
  }, []);

  return (
    <div className="sky pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="sky-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.r,
            height: s.r,
            opacity: s.o,
            animationDuration: `${s.d}s`,
            animationDelay: `${i * 0.13}s`,
            animationPlayState: reduced ? 'paused' : 'running',
          }}
        />
      ))}

      {planets.map((p) => (
        <div
          key={p.cx}
          className="sky-orbit-host"
          style={{
            left: p.cx,
            top: p.cy,
            width: p.rx * 2,
            height: p.rx * 2,
            ['--squash' as string]: p.ry / p.rx,
          }}
        >
          <div
            className="sky-orbit-spin"
            style={{
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              animationPlayState: reduced ? 'paused' : 'running',
            }}
          >
            <span
              className="sky-planet-wrap"
              style={{
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                animationPlayState: reduced ? 'paused' : 'running',
              }}
            >
              {p.ring && <i className="sky-ring" />}
              <i
                className="sky-planet"
                style={{
                  width: p.size,
                  height: p.size,
                  background: p.fill,
                  boxShadow: `inset -3px -2px 7px rgba(0,0,0,0.45), 0 0 14px ${p.glow}`,
                }}
              />
            </span>
          </div>
        </div>
      ))}

      <div
        className="sky-orbit-host"
        style={{
          left: '58%',
          top: '10%',
          width: 520,
          height: 520,
          ['--squash' as string]: 0.78,
        }}
      >
        <div
          className="sky-orbit-spin"
          style={{
            animationDuration: '140s',
            animationDelay: '-28s',
            animationPlayState: reduced ? 'paused' : 'running',
          }}
        >
          <span
            className="sky-planet-wrap"
            style={{
              animationDuration: '140s',
              animationDelay: '-28s',
              animationPlayState: reduced ? 'paused' : 'running',
            }}
          >
            <span className="sky-moon">
              <span className="sky-moon-glow" />
              <span className="sky-moon-face">
                <span className="sky-crater sky-crater-a" />
                <span className="sky-crater sky-crater-b" />
                <span className="sky-crater sky-crater-c" />
              </span>
            </span>
          </span>
        </div>
      </div>

      {floaters.map((f) => (
        <div
          key={f.emoji}
          className="sky-orbit-host"
          style={{
            left: f.cx,
            top: f.cy,
            width: f.rx * 2,
            height: f.rx * 2,
            ['--squash' as string]: f.ry / f.rx,
          }}
        >
          <div
            className="sky-orbit-spin"
            style={{
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              animationPlayState: reduced ? 'paused' : 'running',
            }}
          >
            <span
              className="sky-planet-wrap"
              style={{
                animationDuration: `${f.duration}s`,
                animationDelay: `${f.delay}s`,
                animationPlayState: reduced ? 'paused' : 'running',
              }}
            >
              <span
                className="sky-floater"
                style={{
                  fontSize: f.size,
                  animationPlayState: reduced ? 'paused' : 'running',
                }}
              >
                {f.emoji}
              </span>
            </span>
          </div>
        </div>
      ))}

      {!reduced &&
        shoots.map((s, i) => (
          <span
            key={`shoot-${i}`}
            className="sky-shoot"
            style={{
              top: s.top,
              left: s.left,
              width: s.length,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
    </div>
  );
}
