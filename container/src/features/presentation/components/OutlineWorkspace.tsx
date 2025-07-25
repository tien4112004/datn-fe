import { Button } from '@/shared/components/ui/button';
import OutlineCard from './OutlineCard';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useState } from 'react';
import { Download, Loader, Plus } from 'lucide-react';

type OutlineWorkspaceProps = {
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  onDownload?: () => Promise<void>;
};

const OutlineWorkspace = ({ items, setItems, onDownload }: OutlineWorkspaceProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOutlineCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle item reordering
      if (activeId.startsWith('outline-card-') && overId.startsWith('outline-card-')) {
        const activeItemId = activeId.replace('outline-card-', '');
        const overItemId = overId.replace('outline-card-', '');

        setItems((prevItems) => {
          const oldIndex = prevItems.findIndex((id) => id === activeItemId);
          const newIndex = prevItems.findIndex((id) => id === overItemId);
          return arrayMove(prevItems, oldIndex, newIndex);
        });
      }
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if (onDownload) {
        await onDownload();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-accent flex w-full justify-center p-8">
      <div className="bg-background flex w-full max-w-3xl flex-col items-center gap-6 rounded-xl p-8">
        <DndContext sensors={sensors} onDragEnd={handleOutlineCardDragEnd}>
          <SortableContext
            items={items.map((id) => `outline-card-${id}`)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((id, index) => (
              <OutlineCard key={id} id={id} title={`${index + 1}`} />
            ))}
          </SortableContext>
        </DndContext>
        <Button
          variant={'outline'}
          className="mt-4 w-full"
          onClick={() => setItems((prev) => [...prev, (prev.length + 1).toString()])}
        >
          <Plus className="h-4 w-4" />
          Add Outline Card
        </Button>
        <div className="flex w-full items-center justify-between">
          <div>{items.length} Outline Cards</div>
          <Button
            variant={'outline'}
            className="text-muted-foreground"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader className="animate-spin" /> : <Download className="h-4 w-4" />}
            {isDownloading ? 'Downloading...' : 'Download Outline'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutlineWorkspace;
