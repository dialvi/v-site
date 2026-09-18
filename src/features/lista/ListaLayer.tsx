import { useEffect, useMemo, useRef, useState } from 'react';
import {
  currentUnlock,
  daysLabel,
  isSlotOpen,
  isUnlockDay,
  optionsFor,
  slotById,
  slotUnlockAt,
  TOTAL_SLOTS,
  type Plan,
  type Slot,
} from '@/content/plans';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { pingListaChoice } from '@/lib/watch';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useUniverseState } from '@/state/UniverseState';

type Props = {
  onBack: () => void;
};

type Screen =
  | { kind: 'field' }
  | { kind: 'choose'; slot: Slot }
  | { kind: 'reveal'; slot: Slot; plan: Plan; enjoyed: boolean };

function giftsFor(slot: Slot): [Plan, Plan] | undefined {
  return optionsFor(slot);
}

const TILTS = [-1.8, 1.4, -0.9, 2.1, 0.6, -1.5];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const STAGGER = 220;

const RING = { inX: 32, inY: 28 };

function yearPos(i: number, rx = RING.inX, ry = RING.inY) {
  const t = ((i - 1) / TOTAL_SLOTS) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + rx * Math.cos(t), y: 50 + ry * Math.sin(t) };
}

function outwardDeg(x: number, y: number) {
  return Math.atan2(y - 50, x - 50) * (180 / Math.PI);
}

export function ListaLayer({ onBack }: Props) {
  const openUntil = currentUnlock();
  const { save, patch } = useUniverseState();
  const [screen, setScreen] = useState<Screen>({ kind: 'field' });
  const backToVale = useRef<number>();

  useEffect(() => () => window.clearTimeout(backToVale.current), []);

  const goVale = () => {
    window.clearTimeout(backToVale.current);
    setScreen({ kind: 'field' });
  };

  const planFor = (slot: Slot): { plan: Plan; enjoyed: boolean } | null => {
    if (slot.done) return { plan: slot.done, enjoyed: true };
    const picked = save.choices[String(slot.id)];
    const gifts = giftsFor(slot);
    if (gifts && picked != null && gifts[picked]) {
      return { plan: gifts[picked], enjoyed: false };
    }
    return null;
  };

  const openSlot = (id: number) => {
    const slot = slotById(id);
    if (!slot) return;
    if (!isSlotOpen(id)) {
      haptic('light');
      return;
    }
    haptic('medium');

    const known = planFor(slot);
    if (known) {
      setScreen({ kind: 'reveal', slot, plan: known.plan, enjoyed: known.enjoyed });
      return;
    }

    const gifts = giftsFor(slot);
    if (gifts) {
      setScreen({ kind: 'choose', slot: { ...slot, options: gifts } });
      return;
    }

    setScreen({
      kind: 'reveal',
      slot,
      plan: {
        title: 'Pronto',
        emoji: '✦',
        body: 'Esta casilla ya está abierta. Los dos planes llegan en la próxima actualización.',
      },
      enjoyed: false,
    });
  };

  const choose = (slot: Slot, index: number) => {
    if (!slot.options) return;
    haptic('success');
    const plan = slot.options[index];
    pingListaChoice(slot.id, `${plan.emoji} ${plan.title}`);
    void patch({
      choices: { ...save.choices, [String(slot.id)]: index },
      unlockedFirst: true,
    });
    setScreen({ kind: 'reveal', slot, plan, enjoyed: false });
    window.clearTimeout(backToVale.current);
    backToVale.current = window.setTimeout(goVale, 2000);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-ink animate-depth-in">
      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-[calc(var(--safe-top)+1.75rem)]">
        <BackChip
          onClick={() => {
            if (screen.kind === 'field') onBack();
            else goVale();
          }}
          label={screen.kind === 'field' ? 'universo' : 'vale'}
        />
        {screen.kind === 'field' && (
          <p className="text-[12px] uppercase tracking-[0.28em] text-paper/45">La lista</p>
        )}
      </header>

      <div className="relative min-h-0 flex-1">
        {screen.kind === 'field' && (
          <Field
            openUntil={openUntil}
            choices={save.choices}
            onOpen={openSlot}
          />
        )}
        {screen.kind === 'choose' && (
          <Choose
            slot={screen.slot}
            onChoose={(i) => choose(screen.slot, i)}
          />
        )}
        {screen.kind === 'reveal' && (
          <Reveal slot={screen.slot} plan={screen.plan} enjoyed={screen.enjoyed} />
        )}
      </div>
    </div>
  );
}

function wishPath(w: number, h: number, land: { x: number; y: number }) {
  const r = (n: number) => Math.round(n * 10) / 10;
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.52;
  const ry = h * 0.46;
  const lx = (land.x / 100) * w;
  const ly = (land.y / 100) * h;
  const sx = cx;
  const sy = cy - ry;
  return [
    `M ${r(sx)} ${r(sy)}`,
    `A ${r(rx)} ${r(ry)} 0 1 1 ${r(cx)} ${r(cy + ry)}`,
    `A ${r(rx)} ${r(ry)} 0 1 1 ${r(sx)} ${r(sy)}`,
    `C ${r(cx + rx * 0.28)} ${r(-h * 0.12)} ${r((lx + cx) / 2)} ${r(ly - h * 0.34)} ${r(lx)} ${r(ly)}`,
  ].join(' ');
}

function WishStar({
  land,
  play,
  onLanded,
  onClick,
}: {
  land: { x: number; y: number };
  play: boolean;
  onLanded: () => void;
  onClick: () => void;
}) {
  const host = useRef<HTMLButtonElement>(null);
  const onLandedRef = useRef(onLanded);
  onLandedRef.current = onLanded;
  const finished = useRef(!play);
  const [path, setPath] = useState('');
  const [landed, setLanded] = useState(!play);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setLanded(true);
    onLandedRef.current();
  };

  useEffect(() => {
    const box = host.current?.offsetParent as HTMLElement | null;
    if (!box) return;
    const draw = () => {
      if (box.clientWidth < 8 || box.clientHeight < 8) return;
      const next = wishPath(box.clientWidth, box.clientHeight, land);
      setPath((prev) => (prev === next ? prev : next));
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(box);
    return () => ro.disconnect();
  }, [land.x, land.y]);

  useEffect(() => {
    if (!play || !path || landed) return;
    const t = window.setTimeout(() => {
      if (finished.current) return;
      finished.current = true;
      setLanded(true);
      onLandedRef.current();
    }, 8500);
    return () => window.clearTimeout(t);
  }, [path, play, landed]);

  return (
    <button
      ref={host}
      type="button"
      aria-label="Pedir un deseo"
      disabled={!landed}
      onClick={onClick}
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.animationName && e.animationName !== 'vale-wish-run') return;
        finish();
      }}
      className={`vale-wish${landed || !path ? ' vale-wish-land' : ''}${!path && play ? ' opacity-0' : ''}`}
      style={
        landed || !path
          ? { left: `${land.x}%`, top: `${land.y}%` }
          : { left: 0, top: 0, offsetPath: `path('${path}')` }
      }
    >
      <i className="vale-streak" />
      <i className="vale-dot" />
    </button>
  );
}

function Field({
  openUntil,
  choices,
  onOpen,
}: {
  openUntil: number;
  choices: Record<string, number>;
  onOpen: (id: number) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const play = !reduced;
  const cells = useMemo(() => Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1), []);
  const wishId =
    cells.find((id) => isUnlockDay(id) && !slotById(id)?.done) ?? null;
  const lived = useMemo(
    () =>
      cells.filter(
        (id) =>
          id !== wishId &&
          (Boolean(slotById(id)?.done) ||
            (id <= openUntil && choices[String(id)] != null)),
      ),
    [cells, choices, wishId, openUntil],
  );
  const orbiting = cells.filter((id) => !lived.includes(id) && id !== wishId);
  const nextLocked = openUntil < TOTAL_SLOTS ? openUntil + 1 : null;
  const nextAt = nextLocked ? slotUnlockAt(nextLocked) : null;
  const [whisper, setWhisper] = useState<string | null>(null);
  const [wishLanded, setWishLanded] = useState(!play || !wishId);

  useEffect(() => {
    setWishLanded(!play || !wishId);
    setWhisper(null);
  }, [wishId, play]);

  return (
    <div className="absolute inset-0 scroll-y px-5 pb-[calc(var(--safe-bottom)+2.5rem)]">
      <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80">Un vale · 1 año · 24 destinos</p>
      <h2 className="mt-2 font-display text-[2.1rem] italic leading-[1.05] text-paper">
        Algunos chill.
        <br />
        Otros no tanto.
      </h2>
      <p className="mt-3 max-w-[32ch] text-[16px] leading-relaxed text-paper/70">
        Un vale por un año de experiencias. Cuando cae una estrella fugaz, debes pedir un deseo. El 20 de septiembre cae la siguiente, y a partir de ahí cada 15 días.
      </p>

      <div className="mx-auto mt-1 w-full max-w-[22rem] px-6 pt-10 pb-2">
        <div className="vale-sky relative aspect-square w-full overflow-visible">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
          <ellipse
            cx="50"
            cy="50"
            rx={RING.inX}
            ry={RING.inY}
            fill="none"
            stroke="rgba(232,184,109,0.28)"
            strokeWidth="0.35"
          />
        </svg>

        <div className="vale-orbit" aria-hidden>
          {orbiting.map((n, i) => {
            const ring = i % 3;
            const rx = [44, 39, 34][ring];
            const ry = [38, 34, 30][ring];
            const dur = [41, 53, 67][ring];
            return (
              <span
                key={n}
                className="vale-orbit-star"
                style={{
                  offsetPath: `ellipse(${rx}% ${ry}% at 50% 50%)`,
                  animationDuration: `${dur}s`,
                  animationDelay: `${-(i * 4.7)}s`,
                }}
              >
                <i className="vale-orbit-tail" />
                <i className="vale-orbit-dot" />
              </span>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-[1.35rem] italic leading-none text-paper">el vale</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-gold/75">
            {wishLanded && wishId ? 'pide un deseo' : `${lived.length} vividos · ${orbiting.length} en el cielo`}
          </p>
        </div>

        {lived.map((n, i) => {
          const { x, y } = yearPos(n);
          const slot = slotById(n);
          return (
            <button
              key={n}
              type="button"
              aria-label={slot?.done?.title ?? `Casilla ${n}`}
              onClick={() => onOpen(n)}
              className="vale-fall"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${i * STAGGER}ms`,
                ['--out' as string]: `${outwardDeg(x, y)}deg`,
              }}
            >
              <i className="vale-streak" />
              <i className="vale-wake" />
              <i className="vale-dot h-[9px] w-[9px]" />
            </button>
          );
        })}

        {wishId && (
          <WishStar
            key={wishId}
            land={yearPos(wishId)}
            play={play}
            onLanded={() => {
              setWishLanded(true);
              haptic('success');
              setWhisper('Toca la estrella.');
            }}
            onClick={() => onOpen(wishId)}
          />
        )}
        </div>
      </div>

      <p className="mt-2 text-center text-[13px] leading-relaxed text-paper/45">
        {whisper ??
          (wishId && !wishLanded
            ? 'Una va a caer…'
            : nextAt
              ? `Se desbloquea ${daysLabel(nextAt)}`
              : 'El año de vales ya está entero.')}
      </p>

      <p className="mt-6 text-[12px] uppercase tracking-[0.28em] text-gold/80">Talonario</p>
      <ul className="mt-4 space-y-3">
        {nextLocked && nextAt && (
          <li>
            <div className="vale-stub vale-stub-soon w-full text-left" style={{ rotate: '1.2deg' }}>
              <span className="text-[11px] uppercase tracking-[0.22em] text-gold/70">
                {pad(nextLocked)} · próximo
              </span>
              <span className="mt-2 flex items-baseline justify-between gap-3">
                <span className="font-display text-[1.55rem] italic leading-[1.1] text-paper">
                  Se desbloquea {daysLabel(nextAt)}
                </span>
                <span className="shrink-0 text-[1.35rem]" aria-hidden>
                  ✦
                </span>
              </span>
            </div>
          </li>
        )}
        {[...cells.filter((n) => n <= openUntil)].reverse().map((n, i) => {
            const slot = slotById(n);
            if (!slot) return null;
            const enjoyed = Boolean(slot.done);
            const picked = choices[String(n)];
            const gifts = giftsFor(slot);
            const plan = slot.done ?? (gifts && picked != null ? gifts[picked] : undefined);
            const waiting = openUntil === n && !enjoyed && !plan && Boolean(slot.options);
            return (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => onOpen(n)}
                  className={`vale-stub w-full text-left ${enjoyed ? 'vale-stub-used' : ''}`}
                  style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}
                >
                  {enjoyed && <span className="vale-used-mark">usado</span>}
                  <span className="text-[11px] uppercase tracking-[0.22em] text-gold/70">
                    {pad(n)}
                    {enjoyed ? ' · disfrutado' : waiting ? ' · elige' : plan ? ' · elegido' : ' · abierto'}
                  </span>
                  <span className="mt-2 flex items-baseline justify-between gap-3">
                    <span className="font-display text-[1.55rem] italic leading-[1.1] text-paper">
                      {plan?.title ?? (waiting ? '¿Cuál de las dos?' : 'Pronto')}
                    </span>
                    <span className="shrink-0 text-[1.35rem]" aria-hidden>
                      {plan?.emoji ?? '✦'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

function Choose({ slot, onChoose }: { slot: Slot; onChoose: (index: number) => void }) {
  const options = slot.options;
  const [opened, setOpened] = useState(0);
  const [tearing, setTearing] = useState<number | null>(null);
  if (!options) return null;
  const ready = opened >= 2;

  const unwrap = (i: number) => {
    if (i !== opened) return;
    haptic('medium');
    setTearing(i);
    window.setTimeout(() => {
      setOpened(i + 1);
      setTearing(null);
    }, 620);
  };

  return (
    <div className="absolute inset-0 scroll-y px-6 pb-[calc(var(--safe-bottom)+2rem)]">
      <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80">Casilla {pad(slot.id)}</p>
      <h2 className="mt-3 font-display text-[2.25rem] italic leading-[1.05] text-paper">
        {ready ? '¿Cuál de las dos?' : 'Pide un deseo'}
      </h2>
      <p className="mt-4 max-w-[32ch] text-[16px] leading-relaxed text-paper/65">
        {ready
          ? 'Eliges una. La otra no se pierde: espera su momento.'
          : opened === 0
            ? 'Toca el papel. Uno, y después el otro.'
            : 'Ahora el otro.'}
      </p>
      <div className="mt-10 grid gap-5">
        {options.map((opt, i) => {
          const wrapped = opened <= i;
          const canPick = ready;
          return (
            <div key={opt.title} className="vale-gift">
              {wrapped ? (
                <button
                  type="button"
                  disabled={opened !== i || tearing !== null}
                  onClick={() => unwrap(i)}
                  className={`vale-wrap w-full ${tearing === i ? 'vale-wrap-open' : ''} ${opened !== i ? 'opacity-55' : ''}`}
                >
                  <i className="vale-ribbon-x" />
                  <i className="vale-ribbon-y" />
                  <i className="vale-bow" />
                  <span className="relative z-10 flex min-h-[9.5rem] items-end px-5 pb-4">
                    <span className="font-display text-[1.15rem] italic text-paper/90">
                      {opened === i ? 'Tocar el papel' : 'Espera'}
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canPick}
                  onClick={() => canPick && onChoose(i)}
                  className={`vale-stub vale-unwrap-in w-full text-left ${canPick ? '' : 'pointer-events-none'}`}
                  style={{ rotate: `${i === 0 ? -1.6 : 1.8}deg` }}
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">opción {pad(i + 1)}</p>
                  <p className="mt-3 text-[1.8rem]" aria-hidden>
                    {opt.emoji}
                  </p>
                  <p className="mt-2 font-display text-[2rem] italic leading-[1.05] text-paper">{opt.title}</p>
                  {canPick && (
                    <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-gold/80">elegir este</p>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Reveal({ slot, plan, enjoyed }: { slot: Slot; plan: Plan; enjoyed: boolean }) {
  return (
    <div className="absolute inset-0 scroll-y px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
      <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80">
        {pad(slot.id)} · {enjoyed ? 'disfrutado' : 'elegido'}
      </p>
      <p className="mt-5 text-[2.4rem]" aria-hidden>
        {plan.emoji}
      </p>
      <h2 className="mt-4 font-display text-[2.35rem] italic leading-[1.05] text-paper">{plan.title}</h2>
      <p className="selectable mt-8 whitespace-pre-line text-[18px] leading-relaxed text-paper/75">{plan.body}</p>
    </div>
  );
}
