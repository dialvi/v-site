import { useState } from 'react';
import { Universe } from '@/features/universe/Universe';
import { Gate } from '@/features/gate/Gate';
import { isUnlocked } from '@/lib/gate';

export default function App() {
  const [open, setOpen] = useState(() => isUnlocked());

  if (!open) {
    return <Gate onUnlock={() => setOpen(true)} />;
  }

  return <Universe />;
}
