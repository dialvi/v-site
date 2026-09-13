import { useMemo, useState } from 'react';
import {
  currentWeek,
  isWeekOpen,
  planById,
  TOTAL_PLANS,
  weeks,
  type Plan,
  type WeekOffer,
} from '@/content/plans';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { loadSave, writeSave } from '@/lib/storage';

type Props = {
  onBack: () => void;
  onFirstUnlock?: () => void;
};

type Screen = 'field' | 'choose' | 'reveal';

export function ListaLayer({ onBack, onFirstUnlock }: Props) {
  const weekNow = currentWeek();
  const save = loadSave();
  const [screen, setScreen] = useState<Screen>('field');
  const [activeWeek, setActiveWeek] = useState(1);
  const [revealed, setRevealed] = useState<Plan | null>(null);
  const [choices, setChoices] = useState<Record<string, number>>(save.choices);

  const offer = weeks[activeWeek - 1];

  const openWeek = (week: number) => {
    if (!isWeekOpen(week)) {
      haptic('light');
      return;
    }
    haptic('medium');
    setActiveWeek(week);
    const existing = choices[String(week)];
    if (existing) {
      setRevealed(planById(existing));
      setScreen('reveal');
      return;
    }
    setScreen('choose');
  };

  const choose = (planId: number) => {
    haptic('success');
    const next = { ...choices, [String(activeWeek)]: planId };
    setChoices(next);
    const first = !loadSave().unlockedFirst;
    writeSave({ choices: next, unlockedFirst: true });
    setRevealed(planById(planId));
    setScreen('reveal');
    if (first) onFirstUnlock?.();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/90 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip
          onClick={() => {
            if (screen === 'field') onBack();
            else setScreen('field');
          }}
          label={screen === 'field' ? 'universo' : 'la lista'}
        />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">La lista</p>
      </header>

      {screen === 'field' && (
        <Field weekNow={weekNow} choices={choices} onOpen={openWeek} />
      )}
      {screen === 'choose' && offer && <Choose offer={offer} onChoose={choose} />}
      {screen === 'reveal' && revealed && <Reveal plan={revealed} week={activeWeek} />}
    </div>
  );
}

function Field({
  weekNow,
  choices,
  onOpen,
}: {
  weekNow: number;
  choices: Record<string, number>;
  onOpen: (week: number) => void;
}) {
  const cells = useMemo(() => Array.from({ length: TOTAL_PLANS }, (_, i) => i + 1), []);

  return (
    <div className="scroll-y flex-1 px-5 pb-[calc(var(--safe-bottom)+2.5rem)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">128 planes</p>
      <h2 className="mt-2 font-display text-[2rem] italic leading-tight text-paper">
        Algunos normales.
        <br />
        Otros no tanto.
      </h2>
      <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-paper/50">
        Cada semana se abre una. Tú eliges. Yo preparo.
      </p>
      <div className="mt-8 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {cells.map((n) => {
          const week = Math.ceil(n / 2);
          const open = isWeekOpen(week);
          const picked = choices[String(week)];
          const isPicked = picked === n;
          const isCurrent = week === weekNow && !picked;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onOpen(week)}
              className={[
                'aspect-square rounded-xl border text-center text-[12px] tracking-[0.12em]',
                isPicked
                  ? 'border-gold/50 bg-gold/15 text-gold'
                  : isCurrent
                    ? 'border-gold/40 bg-gold/10 text-paper animate-pulse'
                    : open
                      ? 'border-paper/15 bg-paper/[0.04] text-paper/70'
                      : 'border-paper/8 bg-transparent text-paper/25',
              ].join(' ')}
            >
              {picked && !isPicked ? (
                <span className="text-paper/25">·</span>
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

function Choose({ offer, onChoose }: { offer: WeekOffer; onChoose: (id: number) => void }) {
  return (
    <div className="flex flex-1 flex-col px-6 pb-[calc(var(--safe-bottom)+2rem)]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Semana {offer.week}</p>
      <h2 className="mt-3 font-display text-[2.3rem] italic text-paper">{offer.prompt}</h2>
      <div className="mt-10 grid gap-3">
        {offer.options.map((opt) => (
          <button
            key={opt.planId}
            type="button"
            onClick={() => onChoose(opt.planId)}
            className="rounded-2xl border border-paper/15 bg-paper/[0.04] px-5 py-6 text-left"
          >
            <p className="text-2xl">{opt.emoji}</p>
            <p className="mt-2 font-display text-2xl italic text-paper">{opt.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Reveal({ plan, week }: { plan: Plan; week: number }) {
  return (
    <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)] animate-depth-in">
      <p className="text-[11px] uppercase tracking-[0.28em] text-paper/40">Has elegido…</p>
      <h2 className="mt-4 font-display text-[2.6rem] italic leading-none text-paper">{plan.title}</h2>
      <p className="mt-3 text-[13px] uppercase tracking-[0.18em] text-gold/75">semana {week}</p>
      <p className="mt-8 whitespace-pre-line text-[17px] leading-relaxed text-paper/75">{plan.body}</p>
      {plan.prep && <p className="mt-8 text-[14px] italic text-dust">{plan.prep}</p>}
    </div>
  );
}
