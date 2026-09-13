type Props = {
  label?: string;
  onClick: () => void;
};

export function BackChip({ label = 'universo', onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto rounded-full border border-paper/15 bg-ink/55 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-paper/75 backdrop-blur-md"
    >
      ← {label}
    </button>
  );
}
