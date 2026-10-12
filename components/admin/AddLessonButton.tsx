'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LessonForm } from './LessonForm';

export function AddLessonButton({
  unitId,
  sectorSlug,
}: {
  unitId: string;
  sectorSlug: string;
}) {
  const [open, setOpen] = useState(false);

  if (open) {
    return <LessonForm unitId={unitId} sectorSlug={sectorSlug} onDone={() => setOpen(false)} />;
  }
  return (
    <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
      <Plus className="h-3.5 w-3.5" /> Add lesson
    </Button>
  );
}
