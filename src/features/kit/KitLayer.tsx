import { useState } from 'react';
import { recipes, type Recipe } from '@/content/kit';
import { BackChip } from '@/components/BackChip';
import { haptic } from '@/lib/haptics';
import { pingKit } from '@/lib/watch';

type Props = {
  onBack: () => void;
};

const TILTS = [-1.4, 1.1, -0.6];

export function KitLayer({ onBack }: Props) {
  const [open, setOpen] = useState<Recipe | null>(null);

  const openRecipe = (recipe: Recipe) => {
    haptic('medium');
    pingKit(recipe.title);
    setOpen(recipe);
  };

  return (
    <div className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden bg-ink animate-depth-in">
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-[calc(var(--safe-top)+1.75rem)]">
        <BackChip onClick={open ? () => setOpen(null) : onBack} label={open ? 'kit' : 'universo'} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-paper/45">Kit de la felicidad</p>
      </header>

      {open ? (
        <RecipeSheet recipe={open} />
      ) : (
        <div className="scroll-y min-h-0 flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
          <p className="text-[12px] uppercase tracking-[0.28em] text-gold/80">Farmacia</p>
          <h2 className="mt-3 font-display text-[2.35rem] italic leading-[1.05] text-paper">
            Kit de la felicidad
          </h2>
          <ul className="mt-10 space-y-5">
            {recipes.map((recipe, i) => (
              <li key={recipe.id}>
                <button
                  type="button"
                  onClick={() => openRecipe(recipe)}
                  className="rx-slip w-full text-left"
                  style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}
                >
                  <RecipeFace recipe={recipe} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RecipeSheet({ recipe }: { recipe: Recipe }) {
  return (
    <div className="scroll-y min-h-0 flex-1 px-6 pb-[calc(var(--safe-bottom)+2.5rem)]">
      <article className="rx-slip rx-slip-open mx-auto mt-6 w-full max-w-[22rem]">
        <RecipeFace recipe={recipe} large />
      </article>
    </div>
  );
}

function RecipeFace({ recipe, large = false }: { recipe: Recipe; large?: boolean }) {
  return (
    <>
      <span className="rx-top">
        <span className="rx-cross" aria-hidden>
          ✚
        </span>
        <span>Farmacia</span>
        <span className="rx-rp">Rp.</span>
      </span>
      <span className="rx-n">{recipe.n}</span>
      <span className={`rx-title${large ? ' rx-title-lg' : ''}`}>{recipe.title}</span>
      {large && recipe.body ? <span className="rx-body">{recipe.body}</span> : null}
    </>
  );
}
