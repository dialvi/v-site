import { useState } from 'react';
import { Universe } from '@/features/universe/Universe';
import { Gate } from '@/features/gate/Gate';
import { isUnlocked } from '@/lib/gate';
import { pingSession } from '@/lib/watch';
import { UniverseStateProvider } from '@/state/UniverseState';

export default function App() {
  const [open, setOpen] = useState(() => {
    const unlocked = isUnlocked();
    if (unlocked) pingSession('return');
    return unlocked;
  });

  if (!open) {
    return <Gate onUnlock={() => setOpen(true)} />;
  }

  return (
    <UniverseStateProvider>
      <Universe />
    </UniverseStateProvider>
  );
}
