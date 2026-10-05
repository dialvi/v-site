import { useState } from 'react';
import { notes, type Note } from '@/content/kit';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { pingKit, pingKitMessage } from '@/lib/watch';

type Props = {
  onBack: () => void;
};

export function KitLayer({ onBack }: Props) {
  const [open, setOpen] = useState<Note | null>(null);

  const openNote = (note: Note) => {
    haptic('medium');
    pingKit(note.title);
    setOpen(note);
  };

  return (
    <div className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden bg-ink animate-depth-in">
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-[calc(var(--safe-top)+1.75rem)]">
        <BackChip onClick={open ? () => setOpen(null) : onBack} label={open ? 'kit' : 'universo'} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Kit de la felicidad</p>
      </header>

      {open ? (
        <NoteSheet note={open} />
      ) : (
        <div className="scroll-y min-h-0 flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
          <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80">Notas</p>
          <h2 className="mt-3 font-display text-[2.35rem] italic leading-[1.05] text-paper">
            Kit de la felicidad
          </h2>
          <ul className="kit-grid mt-8">
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => openNote(note)}
                  className="kit-note h-full w-full text-left"
                >
                  <span className="kit-emoji" aria-hidden>
                    {note.emoji}
                  </span>
                  <span className="kit-title">{note.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NoteSheet({ note }: { note: Note }) {
  return (
    <div className="scroll-y min-h-0 flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
      <article className="kit-sheet mx-auto mt-4 w-full max-w-[24rem]">
        {note.emoji ? (
          <p className="kit-emoji kit-emoji-lg" aria-hidden>
            {note.emoji}
          </p>
        ) : null}
        <h2 className="kit-title kit-title-lg">{note.title}</h2>
        {note.lines?.length ? (
          <div className="kit-lines">
            {note.lines.map((line) => (
              <p key={line} className="kit-line">
                {line}
              </p>
            ))}
          </div>
        ) : null}
        {note.talk ? <Talk title={note.title} /> : null}
      </article>
    </div>
  );
}

const PROMPTS = [
  'me aburroooo',
  'cuéntame algo',
  'quiero un chiste malo',
  'tengo un día regulero',
  'necesito asistencia técnica',
];

function Talk({ title }: { title: string }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  const send = (raw: string) => {
    const message = raw.trim();
    if (!message) return;
    haptic('success');
    pingKitMessage(title, message);
    setText('');
    setSent(message);
  };

  return (
    <form
      className="kit-talk"
      onSubmit={(e) => {
        e.preventDefault();
        send(text);
      }}
    >
      <p className="kit-talk-label">Si quieres hablar y que te cuente un chiste malo →</p>
      <div className="kit-talk-row">
        <input
          className="kit-input selectable"
          value={text}
          maxLength={400}
          enterKeyHint="send"
          placeholder="un mensaje"
          aria-label="un mensaje"
          onChange={(e) => {
            setText(e.target.value);
            if (sent) setSent(null);
          }}
        />
        <button type="submit" className="kit-send">
          Enviar
        </button>
      </div>
      <div className="kit-chips">
        {PROMPTS.map((prompt) => (
          <button key={prompt} type="button" className="kit-chip" onClick={() => send(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
      {sent ? <p className="kit-sent">Enviado.</p> : null}
    </form>
  );
}
