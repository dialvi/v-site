import { useState } from 'react';
import { dossiers, investigationIntro, type Dossier } from '@/content/investigation';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';

type Props = {
  onBack: () => void;
  backLabel?: string;
  focusId?: string;
};

export function InvestigacionLayer({ onBack, backLabel = 'universo', focusId }: Props) {
  const [open, setOpen] = useState<string | null>(focusId ?? null);
  const file = dossiers.find((d) => d.id === open);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/90 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip
          onClick={file ? () => setOpen(null) : onBack}
          label={file ? 'expedientes' : backLabel}
        />
        <p className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Investigación</p>
      </header>

      {file ? (
        <DossierDetail file={file} />
      ) : (
        <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold/75">archivo</p>
          <h2 className="mt-2 font-display text-[1.85rem] italic leading-tight text-paper">
            Archivo de investigación
          </h2>
          <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-paper/50">
            {investigationIntro}
          </p>
          <ul className="mt-8 space-y-3">
            {dossiers.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    haptic('medium');
                    setOpen(item.id);
                  }}
                  className="w-full rounded-2xl border border-paper/10 bg-paper/[0.03] px-5 py-4 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gold/80">{item.code}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-paper/35">{item.stamp}</p>
                  </div>
                  <p className="mt-2 font-display text-xl italic text-paper">{item.title}</p>
                  <p className="mt-1 text-[13px] text-paper/50">{item.lead}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DossierDetail({ file }: { file: Dossier }) {
  return (
    <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)] animate-depth-in">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">{file.code}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-paper/35">{file.stamp}</p>
      <h3 className="mt-4 font-display text-[2.1rem] italic leading-tight text-paper">{file.title}</h3>
      <p className="mt-5 text-[16px] leading-relaxed text-paper/80">{file.lead}</p>
      <p className="selectable mt-5 text-[15px] leading-relaxed text-paper/60">{file.body}</p>
    </div>
  );
}
