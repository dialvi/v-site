import { useState } from 'react';
import { archiveIntro, archivePieces, type ArchivePiece } from '@/content/archive';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { useUniverseState } from '@/state/UniverseState';

type Props = {
  onBack: () => void;
};

export function ArchivoLayer({ onBack }: Props) {
  const { save, patch } = useUniverseState();
  const [open, setOpen] = useState<number | null>(null);
  const piece = archivePieces.find((p) => p.id === open);

  const openPiece = (id: number) => {
    haptic('medium');
    if (!save.openedArchive.includes(id)) {
      void patch({ openedArchive: [...save.openedArchive, id] });
    }
    setOpen(id);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/88 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip onClick={piece ? () => setOpen(null) : onBack} label={piece ? 'archivo' : 'universo'} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Archivo</p>
      </header>

      {piece ? (
        <PieceDetail piece={piece} />
      ) : (
        <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
          <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-gold/75">secreto</p>
          <h2 className="font-display text-[1.85rem] italic leading-tight text-paper">{archiveIntro}</h2>
          <p className="mt-4 max-w-[32ch] text-[14px] leading-relaxed text-paper/50">
            No es un álbum. Son tres fragmentos. El resto se queda fuera a propósito.
          </p>
          <ul className="mt-10 space-y-4">
            {archivePieces.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openPiece(item.id)}
                  className="w-full rounded-2xl border border-paper/10 bg-paper/[0.03] px-5 py-5 text-left"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <p className="font-display text-3xl italic text-gold/90">
                    {String(item.id).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-[15px] text-paper/80">{item.title}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PieceDetail({ piece }: { piece: ArchivePiece }) {
  return (
    <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)] animate-depth-in">
      <p className="font-display text-5xl italic text-gold/90">{String(piece.id).padStart(2, '0')}</p>
      <h3 className="mt-4 font-display text-[2rem] italic leading-tight text-paper">{piece.title}</h3>
      <p className="selectable mt-6 text-[16px] leading-relaxed text-paper/70">{piece.body}</p>
      {piece.image && (
        <div className="mt-8 flex h-40 items-center justify-center rounded-2xl border border-paper/10 text-[12px] uppercase tracking-[0.22em] text-paper/30">
          foto · pendiente
        </div>
      )}
    </div>
  );
}
