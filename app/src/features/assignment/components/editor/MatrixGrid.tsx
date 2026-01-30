import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { MatrixCell } from './MatrixCell';
import { TopicEditModal } from './TopicEditModal';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { getAllDifficulties, getDifficultyI18nKey } from '@aiprimary/core';
import { generateId } from '../../utils';

export const MatrixGrid = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });
  const { t: tMatrix } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixBuilder' });
  const { t: tDifficulty } = useTranslation('questions');

  // Get data from store (matrix counts are auto-synced)
  const topics = useAssignmentFormStore((state) => state.topics);
  const matrixCells = useAssignmentFormStore((state) => state.matrixCells);
  const addTopic = useAssignmentFormStore((state) => state.addTopic);

  // Modal state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  const handleAddTopic = () => {
    const newTopicId = generateId();
    addTopic({ id: newTopicId, name: '', description: '' });
    setEditingTopicId(newTopicId);
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" size="sm" variant="outline" onClick={handleAddTopic}>
                <Plus className="mr-1 h-3 w-3" />
                {t('addTopic')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tMatrix('tooltips.addTopic')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500">{t('emptyMessage')}</p>
        </div>
        <TopicEditModal
          topicId={editingTopicId}
          open={!!editingTopicId}
          onOpenChange={(open) => !open && setEditingTopicId(null)}
        />
      </div>
    );
  }

  const difficulties = getAllDifficulties();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="sm" variant="outline" onClick={handleAddTopic}>
              <Plus className="mr-1 h-3 w-3" />
              {t('addTopic')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tMatrix('tooltips.addTopic')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] bg-gray-50 font-semibold dark:bg-gray-900">
                {t('tableHeaders.topic')}
              </TableHead>
              {difficulties.map((difficulty) => (
                <TableHead
                  key={difficulty.value}
                  className="w-[150px] bg-gray-50 text-center text-xs dark:bg-gray-900"
                >
                  {tDifficulty(getDifficultyI18nKey(difficulty.value) as any)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="w-[300px] align-top font-medium">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="whitespace-normal break-words">
                        {topic.name || t('tableHeaders.topic')}
                      </div>
                      {topic.description && (
                        <div className="whitespace-normal break-words text-xs font-normal text-gray-500">
                          {topic.description}
                        </div>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTopicId(topic.id)}
                          className="h-8 w-8 shrink-0 p-0"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tMatrix('tooltips.editTopic')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                {difficulties.map((difficulty) => {
                  const cell = matrixCells?.find(
                    (c) => c.topicId === topic.id && c.difficulty === difficulty.value
                  );
                  return (
                    <TableCell key={`${topic.id}-${difficulty.value}`} className="w-[150px] p-2">
                      {cell && <MatrixCell cell={cell} />}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TopicEditModal
        topicId={editingTopicId}
        open={!!editingTopicId}
        onOpenChange={(open) => !open && setEditingTopicId(null)}
      />
    </div>
  );
};
