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
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { useState, useCallback, memo } from 'react';
import { Download, Loader, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type OutlineWorkspaceProps = {
  onDownload?: () => Promise<void>;
  totalSlide: number;
};

const OutlineWorkspace = memo(({ onDownload, totalSlide }: OutlineWorkspaceProps) => {
  const deleteContent = useOutlineStore((state) => state.deleteOutline);
  const contentIds = useOutlineStore((state) => state.outlineIds);
  const addContent = useOutlineStore((state) => state.addOutline);
  const isStreaming = useOutlineStore((state) => state.isStreaming);
  const swap = useOutlineStore((state) => state.swap);
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace.outline' });
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDeleteContent = useCallback(
    (id: string) => {
      deleteContent(id);
    },
    [deleteContent]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOutlineCardDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      if (active.id !== over.id) {
        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId.startsWith('outline-card-') && overId.startsWith('outline-card-')) {
          const activeItemId = activeId.replace('outline-card-', '');
          const overItemId = overId.replace('outline-card-', '');

          swap(activeItemId, overItemId);
        }
      }
    },
    [swap]
  );

  const handleDownload = useCallback(async () => {
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
  }, [isDownloading, onDownload]);

  return (
    <Card className="w-3xl flex flex-col gap-6 rounded-xl p-8">
      {contentIds.length > 0 && (
        <DndContext sensors={sensors} onDragEnd={handleOutlineCardDragEnd}>
          <SortableContext
            items={contentIds.map((id) => `outline-card-${id}`)}
            strategy={verticalListSortingStrategy}
          >
            {contentIds.map((item, index) => (
              <OutlineCard key={item} id={item} title={`${index + 1}`} onDelete={handleDeleteContent} />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {!isStreaming && contentIds.length === 0 && (
        <div className="text-muted-foreground flex flex-col items-center justify-center text-center">
          <div className="text-lg font-medium">{t('noCards')}</div>
          <div className="text-sm">{t('clickAddToStart')}</div>
        </div>
      )}

      {isStreaming && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: totalSlide - contentIds.length }).map((_, index) => (
            <Skeleton key={'skeleton-slide-' + index} className="h-12 w-full" />
          ))}
        </div>
      )}

      {/* Add button */}
      <Button
        variant={'outline'}
        className="mt-4 w-full"
        onClick={() => {
          addContent({ id: Date.now().toString(), markdownContent: '' });
        }}
      >
        <Plus className="h-4 w-4" />
        {t('addCard')}
      </Button>
      <div className="flex w-full items-center justify-between">
        <div>
          {contentIds.length} {t('cards')}
        </div>

        {/* Download button */}
        <Button
          variant={'outline'}
          className="text-muted-foreground"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? <Loader className="animate-spin" /> : <Download className="h-4 w-4" />}
          {isDownloading ? t('downloading') : t('download')}
        </Button>
      </div>
    </Card>
  );
});

OutlineWorkspace.displayName = 'OutlineWorkspace';

export default OutlineWorkspace;
