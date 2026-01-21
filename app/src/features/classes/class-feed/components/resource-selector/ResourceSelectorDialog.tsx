import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Presentation, ClipboardList, Search, X } from 'lucide-react';
import { useMindmaps } from '@/features/mindmap/hooks/useApi';
import { usePresentations } from '@/features/presentation/hooks/useApi';
import { useAssignmentList } from '@/features/assignment/hooks/useAssignmentApi';
import { ResourceSelectorGrid } from './ResourceSelectorGrid';
import { useResourceSelector } from './useResourceSelector';
import type { LinkedResource, LinkedResourceType } from '../../types/resource';

interface ResourceSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelection?: LinkedResource[];
  onConfirm: (resources: LinkedResource[]) => void;
}

type TabValue = 'mindmap' | 'presentation' | 'assignment';

export const ResourceSelectorDialog = ({
  open,
  onOpenChange,
  initialSelection = [],
  onConfirm,
}: ResourceSelectorDialogProps) => {
  const { t } = useTranslation('classes');
  const [activeTab, setActiveTab] = useState<TabValue>('mindmap');
  const [searchQuery, setSearchQuery] = useState('');

  const { selectedResources, isSelected, toggleResource, clearSelection, setSelectedResources } =
    useResourceSelector(initialSelection);

  // Fetch resources from each API
  const { data: mindmaps, isLoading: mindmapsLoading } = useMindmaps();
  const { data: presentations, isLoading: presentationsLoading } = usePresentations();
  const { data: assignmentData, isLoading: assignmentsLoading } = useAssignmentList();

  // Transform API data to LinkedResource format
  const mindmapResources: LinkedResource[] = useMemo(
    () =>
      mindmaps.map((m) => ({
        id: m.id,
        type: 'mindmap' as LinkedResourceType,
        title: m.title,
        thumbnail: m.thumbnail,
      })),
    [mindmaps]
  );

  const presentationResources: LinkedResource[] = useMemo(
    () =>
      presentations.map((p) => ({
        id: p.id,
        type: 'presentation' as LinkedResourceType,
        title: p.title,
        thumbnail: typeof p.thumbnail === 'string' ? p.thumbnail : undefined,
      })),
    [presentations]
  );

  const assignmentResources: LinkedResource[] = useMemo(
    () =>
      (assignmentData?.assignments || []).map((a) => ({
        id: a.id,
        type: 'assignment' as LinkedResourceType,
        title: a.title,
      })),
    [assignmentData?.assignments]
  );

  const handleConfirm = useCallback(() => {
    onConfirm(selectedResources);
    onOpenChange(false);
  }, [selectedResources, onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    setSelectedResources(initialSelection);
    setSearchQuery('');
    onOpenChange(false);
  }, [initialSelection, setSelectedResources, onOpenChange]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        handleCancel();
      } else {
        onOpenChange(newOpen);
      }
    },
    [handleCancel, onOpenChange]
  );

  // Count selected items per tab
  const selectedCounts = useMemo(() => {
    const counts: Record<TabValue, number> = {
      mindmap: 0,
      presentation: 0,
      assignment: 0,
    };
    for (const r of selectedResources) {
      if (r.type in counts) {
        counts[r.type as TabValue]++;
      }
    }
    return counts;
  }, [selectedResources]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] !max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('feed.resourceSelector.title')}</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('feed.resourceSelector.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="mindmap" className="gap-1.5">
              <BrainCircuit className="h-4 w-4" />
              {t('feed.resourceSelector.tabs.mindmaps')}
              {selectedCounts.mindmap > 0 && (
                <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs">
                  {selectedCounts.mindmap}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="presentation" className="gap-1.5">
              <Presentation className="h-4 w-4" />
              {t('feed.resourceSelector.tabs.presentations')}
              {selectedCounts.presentation > 0 && (
                <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs">
                  {selectedCounts.presentation}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="assignment" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              {t('feed.resourceSelector.tabs.assignments')}
              {selectedCounts.assignment > 0 && (
                <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs">
                  {selectedCounts.assignment}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="mindmap" className="mt-0">
              <ResourceSelectorGrid
                resources={mindmapResources}
                isLoading={mindmapsLoading}
                isSelected={isSelected}
                onToggle={toggleResource}
                searchQuery={searchQuery}
              />
            </TabsContent>

            <TabsContent value="presentation" className="mt-0">
              <ResourceSelectorGrid
                resources={presentationResources}
                isLoading={presentationsLoading}
                isSelected={isSelected}
                onToggle={toggleResource}
                searchQuery={searchQuery}
              />
            </TabsContent>

            <TabsContent value="assignment" className="mt-0">
              <ResourceSelectorGrid
                resources={assignmentResources}
                isLoading={assignmentsLoading}
                isSelected={isSelected}
                onToggle={toggleResource}
                searchQuery={searchQuery}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {selectedResources.length > 0 && (
                <>
                  {t('feed.resourceSelector.selected', { count: selectedResources.length })}
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-primary ml-2 hover:underline"
                  >
                    {t('feed.resourceSelector.clearSelection')}
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                {t('feed.creator.actions.cancel')}
              </Button>
              <Button onClick={handleConfirm}>{t('feed.resourceSelector.confirm')}</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
