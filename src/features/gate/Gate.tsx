import { useState, type FormEvent } from 'react';
import { phraseMatches, rememberUnlock } from '@/lib/gate';
import { haptic } from '@/lib/haptics';
import { Starfield } from '@/components/Starfield';
import { Grain } from '@/components/Grain';

type Props = {
  onUnlock: () => void;
};

export function Gate({ onUnlock }: Props) {
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!phraseMatches(value)) {
      haptic('light');
      setWrong(true);
      return;
    }
    haptic('success');
    rememberUnlock();
    onUnlock();
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%, #1c1714 0%, #0c0b0a 62%, #070606 100%)',
        }}
      />
      <Starfield />
      <form
        onSubmit={submit}
        className="relative z-20 flex h-full flex-col items-center justify-center safe-pad text-center"
      >
        <p className="font-display text-[2.6rem] italic leading-none text-paper">Valeria</p>
        <p className="mt-6 max-w-[18ch] text-[15px] leading-relaxed text-paper/55">
          Esto no es para cualquiera.
        </p>
        <label className="sr-only" htmlFor="gate">
          Frase
        </label>
        <input
          id="gate"
          type="password"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (wrong) setWrong(false);
          }}
          className="selectable mt-10 w-full max-w-[16rem] border-b border-paper/25 bg-transparent py-3 text-center text-[16px] tracking-[0.18em] text-paper outline-none"
        />
        {wrong && (
          <p className="mt-4 text-[13px] text-dust/80">Esa no es.</p>
        )}
        <button
          type="submit"
          className="mt-10 text-[13px] uppercase tracking-[0.32em] text-gold"
        >
          Entrar →
        </button>
      </form>
      <Grain />
    </div>
  );
}
