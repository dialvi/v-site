import { useState } from 'react';
import { secrets, secretsIntro, type Secret } from '@/content/secrets';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { useUniverseState } from '@/state/UniverseState';

type Props = {
  onBack: () => void;
};

export function SecretosLayer({ onBack }: Props) {
  const { save, patch } = useUniverseState();
  const [open, setOpen] = useState<number | null>(null);
  const secret = secrets.find((s) => s.id === open);

  const openSecret = (id: number) => {
    haptic('medium');
    if (!save.openedSecrets.includes(id)) {
      void patch({ openedSecrets: [...save.openedSecrets, id] });
    }
    setOpen(id);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/90 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip onClick={secret ? () => setOpen(null) : onBack} label={secret ? 'secretos' : 'universo'} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Privado</p>
      </header>

      {secret ? (
        <SecretDetail secret={secret} />
      ) : (
        <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
          <h2 className="font-display text-[1.9rem] italic leading-tight text-paper">Mis secretos</h2>
          <p className="mt-4 max-w-[32ch] text-[14px] leading-relaxed text-paper/50">{secretsIntro}</p>
          <ul className="mt-10 space-y-3">
            {secrets.map((item) => {
              const seen = save.openedSecrets.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openSecret(item.id)}
                    className="w-full rounded-2xl border border-paper/10 bg-paper/[0.03] px-5 py-5 text-left"
                  >
                    <p className="font-display text-3xl italic text-gold/90">
                      {String(item.id).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-[15px] text-paper/80">{item.title}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-paper/35">
                      {seen ? 'abierto' : 'sellado'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function SecretDetail({ secret }: { secret: Secret }) {
  return (
    <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)] animate-depth-in">
      <p className="font-display text-5xl italic text-gold/90">{String(secret.id).padStart(2, '0')}</p>
      <h3 className="mt-4 font-display text-[1.9rem] italic leading-tight text-paper">{secret.title}</h3>
      <p className="selectable mt-6 text-[16px] leading-relaxed text-paper/70">{secret.body}</p>
    </div>
  );
}
