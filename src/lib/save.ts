export type UniverseSave = {
  entered: boolean;
  choices: Record<string, number>;
  completed: number[];
  openedArchive: number[];
  openedSecrets: number[];
  seenSections: string[];
  unlockedFirst: boolean;
};

export const emptySave = (): UniverseSave => ({
  entered: false,
  choices: {},
  completed: [],
  openedArchive: [],
  openedSecrets: [],
  seenSections: [],
  unlockedFirst: false,
});

export function mergeSave(base: UniverseSave, patch: Partial<UniverseSave>): UniverseSave {
  return {
    entered: false,
    choices: patch.choices ?? base.choices,
    completed: patch.completed ?? base.completed,
    openedArchive: patch.openedArchive ?? base.openedArchive,
    openedSecrets: patch.openedSecrets ?? base.openedSecrets,
    seenSections: patch.seenSections ?? base.seenSections,
    unlockedFirst: patch.unlockedFirst ?? base.unlockedFirst,
  };
}
