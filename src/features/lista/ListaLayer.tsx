import { useMemo, useState } from 'react';
import {
  currentUnlock,
  isSlotOpen,
  slotById,
  TOTAL_SLOTS,
  type Plan,
  type Slot,
} from '@/content/plans';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { useUniverseState } from '@/state/UniverseState';

type Props = {
  onBack: () => void;
};

type Screen =
  | { kind: 'field' }
  | { kind: 'choose'; slot: Slot }
  | { kind: 'reveal'; slot: Slot; plan: Plan; enjoyed: boolean };

export function ListaLayer({ onBack }: Props) {
  const openUntil = currentUnlock();
  const { save, patch } = useUniverseState();
  const [screen, setScreen] = useState<Screen>({ kind: 'field' });

  const openSlot = (id: number) => {
    const slot = slotById(id);
    if (!slot || !isSlotOpen(id)) {
      haptic('light');
      return;
    }
    haptic('medium');

    if (slot.done) {
      setScreen({ kind: 'reveal', slot, plan: slot.done, enjoyed: true });
      return;
    }

    const picked = save.choices[String(id)];
    if (slot.options && picked != null && slot.options[picked]) {
      setScreen({ kind: 'reveal', slot, plan: slot.options[picked], enjoyed: false });
      return;
    }

    if (slot.options) {
      setScreen({ kind: 'choose', slot });
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
    void patch({
      choices: { ...save.choices, [String(slot.id)]: index },
      unlockedFirst: true,
    });
    setScreen({ kind: 'reveal', slot, plan: slot.options[index], enjoyed: false });
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/90 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip
          onClick={() => {
            if (screen.kind === 'field') onBack();
            else setScreen({ kind: 'field' });
          }}
          label={screen.kind === 'field' ? 'universo' : 'la lista'}
        />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">La lista</p>
      </header>

      {screen.kind === 'field' && <Field openUntil={openUntil} slotsDone={doneIds()} onOpen={openSlot} />}
      {screen.kind === 'choose' && <Choose slot={screen.slot} onChoose={(i) => choose(screen.slot, i)} />}
      {screen.kind === 'reveal' && <Reveal plan={screen.plan} enjoyed={screen.enjoyed} />}
    </div>
  );
}

function doneIds() {
  return new Set(Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1).filter((id) => slotById(id)?.done));
}

function Field({
  openUntil,
  slotsDone,
  onOpen,
}: {
  openUntil: number;
  slotsDone: Set<number>;
  onOpen: (id: number) => void;
}) {
  const cells = useMemo(() => Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1), []);

  return (
    <div className="scroll-y flex-1 px-5 pb-[calc(var(--safe-bottom)+2.5rem)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Un vale · 1 año · 24 casillas</p>
      <h2 className="mt-2 font-display text-[2rem] italic leading-tight text-paper">
        Algunos chill.
        <br />
        Otros no tanto.
      </h2>
      <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-paper/50">
        Cada dos semanas se abre una casilla. Dos planes. Tú eliges. El otro espera su momento.
      </p>
      <div className="mt-8 grid grid-cols-4 gap-2">
        {cells.map((n) => {
          const open = n <= openUntil;
          const enjoyed = slotsDone.has(n);
          const isCurrent = open && n === openUntil && !enjoyed;
          const slot = slotById(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onOpen(n)}
              className={[
                'aspect-square rounded-xl border text-center text-[12px] tracking-[0.12em]',
                enjoyed
                  ? 'border-gold/70 bg-gold/20 text-gold'
                  : isCurrent
                    ? 'border-gold/40 bg-gold/10 text-paper animate-pulse'
                    : open
                      ? 'border-paper/15 bg-paper/[0.04] text-paper/70'
                      : 'border-paper/8 bg-transparent text-paper/25',
              ].join(' ')}
            >
              {enjoyed ? (
                slot?.done?.emoji ?? '✓'
              ) : open ? (
                n
              ) : (
                <span className="flex flex-col items-center leading-none">
                  <span aria-hidden>🔒</span>
                  <span className="mt-1 text-[9px] text-paper/25">{n}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Choose({ slot, onChoose }: { slot: Slot; onChoose: (index: number) => void }) {
  const options = slot.options;
  if (!options) return null;
  return (
    <div className="flex flex-1 flex-col px-6 pb-[calc(var(--safe-bottom)+2rem)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Casilla {slot.id}</p>
      <h2 className="mt-3 font-display text-[2.3rem] italic text-paper">¿Cuál de las dos?</h2>
      <div className="mt-10 grid gap-3">
        {options.map((opt, i) => (
          <button
            key={opt.title}
            type="button"
            onClick={() => onChoose(i)}
            className="rounded-2xl border border-paper/15 bg-paper/[0.04] px-5 py-6 text-left"
          >
            <p className="text-2xl">{opt.emoji}</p>
            <p className="mt-2 font-display text-2xl italic text-paper">{opt.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Reveal({ plan, enjoyed }: { plan: Plan; enjoyed: boolean }) {
  return (
    <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)] animate-depth-in">
      {enjoyed && (
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Disfrutado</p>
      )}
      <p className={`${enjoyed ? 'mt-4' : ''} text-3xl`}>{plan.emoji}</p>
      <h2 className="mt-4 font-display text-[2.4rem] italic leading-none text-paper">{plan.title}</h2>
      <p className="mt-8 whitespace-pre-line text-[17px] leading-relaxed text-paper/75">{plan.body}</p>
    </div>
  );
}
