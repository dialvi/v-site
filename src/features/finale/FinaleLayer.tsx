import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';

type Props = {
  onBack: () => void;
  onUnlock: () => void;
  alreadyUnlocked: boolean;
};

export function FinaleLayer({ onBack, onUnlock, alreadyUnlocked }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/90 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip onClick={onBack} />
      </header>
      <div className="scroll-y flex-1 px-7 pb-[calc(var(--safe-bottom)+2.5rem)]">
        <p className="font-display text-[2.15rem] italic leading-[1.15] text-paper">
          Esto es solo el comienzo.
        </p>
        <p className="mt-8 text-[16px] leading-relaxed text-paper/70">
          La lista tiene 128 planes.
        </p>
        <p className="mt-5 text-[16px] leading-relaxed text-paper/70">
          Y, por desgracia para ti,
          <br />
          ya tengo algunos bastante avanzados.
        </p>
        <p className="mt-12 font-display text-[1.7rem] italic text-paper">
          Feliz cumpleaños, Vale.{' '}
          <span aria-hidden>🫶</span>
        </p>
        <button
          type="button"
          onClick={() => {
            haptic('success');
            onUnlock();
          }}
          className="mt-12 w-full rounded-full border border-gold/40 bg-gold/10 py-4 text-[12px] uppercase tracking-[0.22em] text-gold"
        >
          {alreadyUnlocked ? 'Volver a la lista →' : 'Desbloquear primer plan →'}
        </button>
      </div>
    </div>
  );
}
