import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { emptySave, mergeSave, type UniverseSave } from '@/lib/save';

type Status = 'local';

type Ctx = {
  save: UniverseSave;
  status: Status;
  patch: (next: Partial<UniverseSave>) => Promise<void>;
};

const STORAGE_KEY = 'v-save';
const UniverseStateContext = createContext<Ctx | null>(null);

function readLocal(): UniverseSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySave();
    return { ...mergeSave(emptySave(), JSON.parse(raw) as Partial<UniverseSave>), entered: false };
  } catch {
    return emptySave();
  }
}

export function UniverseStateProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<UniverseSave>(() =>
    typeof window === 'undefined' ? emptySave() : readLocal(),
  );

  const patch = useCallback(async (next: Partial<UniverseSave>) => {
    setSave((prev) => {
      const merged = mergeSave(prev, next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        /* ignore quota / private mode */
      }
      return merged;
    });
  }, []);

  const value = useMemo(() => ({ save, status: 'local' as const, patch }), [save, patch]);

  return (
    <UniverseStateContext.Provider value={value}>
      {children}
    </UniverseStateContext.Provider>
  );
}

export function useUniverseState() {
  const ctx = useContext(UniverseStateContext);
  if (!ctx) throw new Error('UniverseStateProvider missing');
  return ctx;
}
