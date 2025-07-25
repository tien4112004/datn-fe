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

const OutlineWorkspace = () => {
  const [items, setItems] = useState(['1', '2', '3']);

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
      </div>
    </div>
  );
};

export default OutlineWorkspace;
