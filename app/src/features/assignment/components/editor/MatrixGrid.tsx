import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { MatrixCell } from './MatrixCell';
import { EmptyMatrixCell } from './EmptyMatrixCell';
import { TopicEditModal } from './TopicEditModal';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import {
  getAllDifficulties,
  getAllQuestionTypes,
  getDifficultyI18nKey,
  getQuestionTypeI18nKey,
} from '@aiprimary/core';
import { generateId } from '@aiprimary/core';
import { QuestionTypeIcon } from '@/features/question/components/shared/QuestionTypeIcon';
import type { AssignmentTopic, QuestionType } from '@/features/assignment/types';

export const MatrixGrid = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });
  const { t: tDifficulty } = useTranslation('questions');
  const { t: tQuestionType } = useTranslation('questions');

  // Get data from store (matrix counts are auto-synced)
  const topics = useAssignmentFormStore((state) => state.topics);
  const matrixCells = useAssignmentFormStore((state) => state.matrix);
  const addTopic = useAssignmentFormStore((state) => state.addTopic);
  const updateTopic = useAssignmentFormStore((state) => state.updateTopic);

  // Modal state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // Group rename dialog state
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupNameInput, setGroupNameInput] = useState('');

  const handleAddTopic = () => {
    const newTopicId = generateId();
    addTopic({ id: newTopicId, name: '', description: '' });
    setEditingTopicId(newTopicId);
  };

  // Listen for add topic event from Actions sidebar
  useEffect(() => {
    const handler = () => handleAddTopic();
    window.addEventListener('matrix.addTopic', handler);
    return () => window.removeEventListener('matrix.addTopic', handler);
  });

  const handleAddSubtopic = (parentTopic: string) => {
    const newTopicId = generateId();
    addTopic({ id: newTopicId, name: '', parentTopic });
    setEditingTopicId(newTopicId);
  };

  const handleOpenEditGroup = (groupName: string) => {
    setEditingGroup(groupName);
    setGroupNameInput(groupName);
  };

  const handleSaveGroupName = () => {
    if (editingGroup === null) return;
    const newName = groupNameInput.trim();
    if (newName !== editingGroup) {
      topics.forEach((topic) => {
        const group = topic.parentTopic || topic.name;
        if (group === editingGroup) {
          updateTopic(topic.id, { parentTopic: newName || undefined });
        }
      });
    }
    setEditingGroup(null);
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="space-y-4">
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
  const questionTypes = getAllQuestionTypes();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            {/* First header row: Topic + Difficulties spanning questionTypes */}
            <TableRow>
              <TableHead rowSpan={2} className="w-[160px] bg-gray-50 font-semibold dark:bg-gray-900">
                {t('tableHeaders.topic')}
              </TableHead>
              {difficulties.map((difficulty) => (
                <TableHead
                  key={difficulty.value}
                  colSpan={questionTypes.length}
                  className="bg-gray-50 text-center text-xs font-semibold dark:bg-gray-900"
                >
                  {tDifficulty(getDifficultyI18nKey(difficulty.value) as any)}
                </TableHead>
              ))}
            </TableRow>
            {/* Second header row: Question types under each difficulty */}
            <TableRow>
              {difficulties.map((difficulty) =>
                questionTypes.map((questionType) => (
                  <TableHead
                    key={`${difficulty.value}-${questionType.value}`}
                    className="w-[70px] bg-gray-100 text-center dark:bg-gray-800"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-center">
                          <QuestionTypeIcon type={questionType.value as QuestionType} className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tQuestionType(getQuestionTypeI18nKey(questionType.value) as any)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                ))
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const totalDataCols = difficulties.length * questionTypes.length;

              // Group topics by parentTopic
              const groups = new Map<string, AssignmentTopic[]>();
              const groupOrder: string[] = [];
              topics.forEach((topic) => {
                const group = topic.parentTopic || topic.name;
                if (!groups.has(group)) {
                  groups.set(group, []);
                  groupOrder.push(group);
                }
                groups.get(group)!.push(topic);
              });

              return groupOrder.map((groupName) => {
                const subtopics = groups.get(groupName)!;
                return (
                  <React.Fragment key={groupName}>
                    {/* Topic group header */}
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                      <TableCell colSpan={1 + totalDataCols} className="font-semibold">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span>{groupName}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditGroup(groupName)}
                              className="h-7 w-7 shrink-0 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddSubtopic(groupName)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            {t('addSubtopic')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Subtopic rows */}
                    {subtopics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell className="w-[160px] pl-6 align-top font-medium">
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
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingTopicId(topic.id)}
                              className="h-8 w-8 shrink-0 p-0"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        {difficulties.map((difficulty, difficultyIndex) =>
                          questionTypes.map((questionType) => {
                            const cell = matrixCells?.find(
                              (c) =>
                                c.topicId === topic.id &&
                                c.difficulty === difficulty.value &&
                                c.questionType === questionType.value
                            );
                            const bgColor =
                              difficultyIndex % 2 === 0
                                ? 'bg-white dark:bg-gray-950'
                                : 'bg-gray-50 dark:bg-gray-900';
                            return (
                              <TableCell
                                key={`${topic.id}-${difficulty.value}-${questionType.value}`}
                                className={`w-[70px] p-1 ${bgColor}`}
                              >
                                {cell ? (
                                  <MatrixCell cell={cell} />
                                ) : (
                                  <EmptyMatrixCell
                                    topicId={topic.id}
                                    topicName={topic.name}
                                    difficulty={difficulty.value}
                                    questionType={questionType.value}
                                  />
                                )}
                              </TableCell>
                            );
                          })
                        )}
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              });
            })()}
          </TableBody>
        </Table>
      </div>

      <TopicEditModal
        topicId={editingTopicId}
        open={!!editingTopicId}
        onOpenChange={(open) => !open && setEditingTopicId(null)}
      />

      {/* Group rename dialog */}
      <Dialog open={editingGroup !== null} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('editGroup')}</DialogTitle>
            <DialogDescription>{t('editGroupDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="group-name">{t('groupName')}</Label>
            <Input
              id="group-name"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              placeholder={t('groupNamePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveGroupName();
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
              {t('cancel')}
            </Button>
            <Button type="button" onClick={handleSaveGroupName}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
