import { useState } from 'react';
import { galaxies, secretsIntro, type Galaxy } from '@/content/secrets';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useUniverseState } from '@/state/UniverseState';

type Props = {
  onBack: () => void;
};

export function SecretosLayer({ onBack }: Props) {
  const { save, patch } = useUniverseState();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const galaxy = galaxies.find((g) => g.id === open) ?? null;

  const openGalaxy = (id: number) => {
    haptic('medium');
    if (!save.openedSecrets.includes(id)) {
      void patch({ openedSecrets: [...save.openedSecrets, id] });
    }
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <div className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden bg-ink animate-depth-in">
      <header className="relative z-30 flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-[calc(var(--safe-top)+1.75rem)]">
        <BackChip
          onClick={() => {
            if (galaxy) setOpen(null);
            else onBack();
          }}
          label={galaxy ? 'cerrar' : 'universo'}
        />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Confidencial</p>
      </header>

      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-5">
          <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80">Campo profundo</p>
          <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-paper/65">{secretsIntro}</p>
        </div>

        <div className="absolute inset-x-0 top-[8.2rem] bottom-0">
          <div className="gal-field absolute inset-0" aria-hidden>
            {Array.from({ length: 28 }, (_, i) => (
              <i
                key={i}
                className="gal-dust"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53 + 11) % 100}%`,
                  animationDelay: `${-i * 0.4}s`,
                  opacity: 0.12 + (i % 5) * 0.06,
                }}
              />
            ))}
          </div>

          {galaxies.map((item) => {
            const on = open === item.id;
            const seen = save.openedSecrets.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.catalog}
                aria-pressed={on}
                onClick={() => openGalaxy(item.id)}
                className={`galaxia gal-hue-${item.hue}${on ? ' gal-on' : ''}${seen && !on ? ' gal-seen' : ''}`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.size}rem`,
                  height: `${item.size}rem`,
                  ['--gal-spin' as string]: reduced ? '0s' : `${item.spin}s`,
                  ['--gal-breathe' as string]: reduced ? '0s' : `${6.5 + item.id * 0.9}s`,
                  ['--gal-breathe-delay' as string]: `${-item.id * 1.35}s`,
                  ['--gal-tilt' as string]: `${[-24, 16, -9, 27, -18, 11, -32, 7][item.id - 1]}deg`,
                  ['--gal-squash' as string]: `${[0.36, 0.48, 0.3, 0.52, 0.4, 0.34, 0.5, 0.42][item.id - 1]}`,
                }}
              >
                <i className="gal-halo" />
                <span className="gal-tilt">
                  <i className="gal-disk" />
                  <i className="gal-arms" />
                </span>
                <i className="gal-core" />
              </button>
            );
          })}
        </div>

        {galaxy && (
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 z-20 bg-ink/35"
            onClick={() => setOpen(null)}
          />
        )}
        {galaxy && <GalaxySheet galaxy={galaxy} onClose={() => setOpen(null)} />}
      </div>
    </div>
  );
}

function GalaxySheet({ galaxy, onClose }: { galaxy: Galaxy; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[calc(var(--safe-bottom)+1.4rem)] animate-slide-up">
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-2xl border border-paper/12 bg-ink/90 px-5 py-5 text-left backdrop-blur-md"
      >
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/75">{galaxy.catalog}</p>
        {galaxy.clue ? (
          <p className="mt-3 text-[15px] leading-relaxed text-paper/75">{galaxy.clue}</p>
        ) : (
          <p className="mt-3 text-[15px] leading-relaxed text-paper/55">
            Apenas un objeto en el campo. Sin ficha. Sin pista.
          </p>
        )}
        {galaxy.secret ? (
          <p className="mt-4 text-[16px] leading-relaxed text-paper/85">{galaxy.secret}</p>
        ) : (
          <p className="mt-4 text-[12px] uppercase tracking-[0.2em] text-paper/35">fuera de alcance</p>
        )}
        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-paper/30">cerrar</p>
      </button>
    </div>
  );
}
