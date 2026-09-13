const KEY = 'valeria.universe.v1';

export type UniverseSave = {
  entered: boolean;
  choices: Record<string, number>;
  openedArchive: number[];
  seenSections: string[];
  unlockedFirst: boolean;
};

const empty: UniverseSave = {
  entered: false,
  choices: {},
  openedArchive: [],
  seenSections: [],
  unlockedFirst: false,
};

export function loadSave(): UniverseSave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return { ...empty };
  }
}

export function writeSave(patch: Partial<UniverseSave>) {
  const next = { ...loadSave(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
