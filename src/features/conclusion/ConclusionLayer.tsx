import { BackChip } from '@/components/BackChip';

type Props = {
  onBack: () => void;
  backLabel?: string;
};

export function ConclusionLayer({ onBack, backLabel }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden bg-ink/90 backdrop-blur-md animate-depth-in">
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-[calc(var(--safe-top)+1.75rem)]">
        <BackChip onClick={onBack} label={backLabel} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">La conclusión</p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col justify-center px-7 pb-[calc(var(--safe-bottom)+2.5rem)]">
        <p className="font-display text-[2.15rem] italic leading-[1.15] text-paper">
          Buscando el sentido de la vida.
        </p>
        <p className="mt-8 max-w-[28ch] text-[16px] leading-relaxed text-paper/70">
          Esto conlleva tiempo y paciencia.
        </p>
      </div>
    </div>
  );
}
