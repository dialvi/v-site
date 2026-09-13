import { useState } from 'react';
import { storyBeats, type StoryBeat } from '@/content/story';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';

type Props = {
  onBack: () => void;
};

export function HistoriaLayer({ onBack }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const beat = storyBeats.find((b) => b.id === open);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-ink/88 backdrop-blur-md animate-depth-in">
      <header className="safe-pad flex items-center justify-between pb-2">
        <BackChip onClick={beat ? () => setOpen(null) : onBack} label={beat ? 'historia' : 'universo'} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Nuestra historia</p>
      </header>

      {beat ? <BeatDetail beat={beat} /> : <Timeline onOpen={(id) => { haptic('medium'); setOpen(id); }} />}
    </div>
  );
}

function Timeline({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
      <p className="mb-8 font-display text-[1.65rem] italic leading-tight text-paper/90">
        No está todo.
        <br />
        Están las cosas que se me quedaron.
      </p>
      <ol className="relative ml-1 border-l border-gold/25 pl-6">
        {storyBeats.map((beat, i) => (
          <li key={beat.id} className="relative mb-10 last:mb-0" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-gold shadow-[0_0_16px_#e8b86d]" />
            <button type="button" onClick={() => onOpen(beat.id)} className="w-full text-left">
              <p className="mb-1 text-[11px] uppercase tracking-[0.24em] text-gold/80">
                {beat.index} · {beat.emoji}
              </p>
              <h3 className="font-display text-2xl italic text-paper">{beat.title}</h3>
              <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-paper/65">{beat.lead}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-paper/35">acercarse →</p>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BeatDetail({ beat }: { beat: StoryBeat }) {
  return (
    <div className="scroll-y flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)] animate-depth-in">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">
        {beat.index} · {beat.emoji}
      </p>
      <h2 className="mt-3 font-display text-[2.4rem] italic leading-none text-paper">{beat.title}</h2>
      <p className="mt-5 text-[17px] leading-relaxed text-paper/80">{beat.lead}</p>
      <p className="selectable mt-5 whitespace-pre-line text-[15px] leading-relaxed text-paper/60">{beat.body}</p>
      {beat.note && <p className="mt-6 text-[13px] italic text-dust/70">{beat.note}</p>}
      {beat.image && <MediaFrame kind="foto" src={beat.image} />}
      {beat.audio && <AudioSlot src={beat.audio} />}
    </div>
  );
}

function MediaFrame({ kind, src }: { kind: string; src: string }) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-paper/10 bg-night">
      <img
        src={src}
        alt=""
        className="hidden max-h-64 w-full object-cover"
        onLoad={(e) => {
          e.currentTarget.classList.remove('hidden');
          e.currentTarget.nextElementSibling?.classList.add('hidden');
        }}
      />
      <div className="flex h-40 items-center justify-center text-[12px] uppercase tracking-[0.24em] text-paper/35">
        {kind} · pendiente
      </div>
    </div>
  );
}

function AudioSlot({ src }: { src: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-paper/10 bg-night/80 px-4 py-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-paper/40">audio</p>
      <audio controls preload="none" src={src} className="w-full">
        Tu navegador no puede reproducir el audio.
      </audio>
    </div>
  );
}
