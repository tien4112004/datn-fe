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
import { useTranslation } from 'react-i18next';
import type { OutlineItem } from '../types/outline';

type OutlineWorkspaceProps = {
  items: OutlineItem[];
  setItems: (items: OutlineItem[]) => void;
  onDownload?: () => Promise<void>;
};

const OutlineWorkspace = ({ items, setItems, onDownload }: OutlineWorkspaceProps) => {
  const { t } = useTranslation('outlineWorkspace');
  const [isDownloading, setIsDownloading] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const safeItems = Array.isArray(items) ? items : [];

  const handleOutlineCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId.startsWith('outline-card-') && overId.startsWith('outline-card-')) {
        const activeItemId = activeId.replace('outline-card-', '');
        const overItemId = overId.replace('outline-card-', '');
        const oldIndex = safeItems.findIndex((item) => item.id === activeItemId);
        const newIndex = safeItems.findIndex((item) => item.id === overItemId);
        setItems(arrayMove(safeItems, oldIndex, newIndex));
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
    } catch (error) {
      // Handle download errors gracefully
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = (id: string) => {
    setItems(safeItems.filter((item) => item.id !== id));
  };

  const handleContentChange = (id: string, html: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, htmlContent: html } : item)));
  };

  return (
    <div className="bg-card w-3xl flex flex-col gap-6 rounded-xl p-8">
      <DndContext sensors={sensors} onDragEnd={handleOutlineCardDragEnd}>
        <SortableContext
          items={safeItems.map((item) => `outline-card-${item.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {safeItems.map((item, index) => (
            <OutlineCard
              key={item.id}
              id={item.id}
              title={`${index + 1}`}
              htmlContent={item.htmlContent}
              onDelete={() => handleDelete(item.id)}
              onContentChange={(html) => handleContentChange(item.id, html)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add button */}
      <Button
        variant={'outline'}
        className="mt-4 w-full"
        onClick={() => setItems([...safeItems, { id: Date.now().toString(), htmlContent: '' }])}
      >
        <Plus className="h-4 w-4" />
        {t('addOutlineCard')}
      </Button>

      <div className="flex w-full items-center justify-between">
        <div>
          {safeItems.length} {t('outlineCards')}
        </div>

        {/* Download button */}
        <Button
          variant={'outline'}
          className="text-muted-foreground"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? <Loader className="animate-spin" /> : <Download className="h-4 w-4" />}
          {isDownloading ? t('downloading') : t('downloadOutline')}
        </Button>
      </div>
    </div>
  );
};

export default OutlineWorkspace;
