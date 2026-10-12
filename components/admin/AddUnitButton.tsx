'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UnitForm } from './UnitForm';

export function AddUnitButton({ sectorId }: { sectorId: string }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="w-full md:w-96">
        <UnitForm sectorId={sectorId} onDone={() => setOpen(false)} />
      </div>
    );
  }
  return (
    <Button size="sm" onClick={() => setOpen(true)}>
      <Plus className="h-3.5 w-3.5" /> Add unit
    </Button>
  );
}
