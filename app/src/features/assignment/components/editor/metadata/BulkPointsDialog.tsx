import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Badge } from '@ui/badge';
import { Label } from '@ui/label';
import { getQuestionTypeName } from '@aiprimary/core';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';

interface BulkPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, only show questions belonging to this context */
  contextId?: string;
}

export const BulkPointsDialog = ({ open, onOpenChange, contextId }: BulkPointsDialogProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.bulkPointsDialog' });

  const allQuestions = useAssignmentFormStore((state) => state.questions);
  const updateQuestion = useAssignmentFormStore((state) => state.updateQuestion);

  // Filter questions by contextId if provided
  const filteredEntries = useMemo(() => {
    return allQuestions
      .map((q, originalIndex) => ({ q, originalIndex }))
      .filter(({ q }) => (contextId ? q.question.contextId === contextId : true));
  }, [allQuestions, contextId]);

  // Local state: map of filtered index -> points value
  const [pointsMap, setPointsMap] = useState<Map<number, number>>(new Map());
  const [setAllValue, setSetAllValue] = useState('');

  // Initialize local state when dialog opens
  useEffect(() => {
    if (open) {
      const initial = new Map<number, number>();
      filteredEntries.forEach(({ q }, i) => initial.set(i, q.points || 0));
      setPointsMap(initial);
      setSetAllValue('');
    }
  }, [open, filteredEntries]);

  const handleSetAll = () => {
    const val = parseInt(setAllValue, 10);
    if (isNaN(val) || val < 0) return;
    const newMap = new Map<number, number>();
    filteredEntries.forEach((_, i) => newMap.set(i, val));
    setPointsMap(newMap);
  };

  const handlePointsChange = (index: number, value: string) => {
    const val = parseInt(value, 10);
    setPointsMap((prev) => new Map(prev).set(index, isNaN(val) || val < 0 ? 0 : val));
  };

  const handleApply = () => {
    pointsMap.forEach((points, filteredIndex) => {
      const entry = filteredEntries[filteredIndex];
      if (!entry) return;
      const currentPoints = entry.q.points || 0;
      if (points !== currentPoints) {
        updateQuestion(entry.originalIndex, { points });
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {/* Set All Section */}
        <div className="flex items-end gap-3 border-b pb-4">
          <div className="flex-1 space-y-1">
            <Label>{t('setAllLabel')}</Label>
            <Input
              type="number"
              min={0}
              value={setAllValue}
              onChange={(e) => setSetAllValue(e.target.value)}
              placeholder={t('setAllPlaceholder') as string}
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleSetAll}>
            {t('setAllButton')}
          </Button>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            {filteredEntries.map(({ q }, index) => (
              <div key={q.question.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </div>
                <Badge variant="outline" className="flex-shrink-0 text-xs">
                  {getQuestionTypeName(q.question.type)}
                </Badge>
                <div className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-gray-400">
                  {q.question.title || t('untitledQuestion')}
                </div>
                <Input
                  type="number"
                  min={0}
                  value={pointsMap.get(index) ?? 0}
                  onChange={(e) => handlePointsChange(index, e.target.value)}
                  className="w-24 flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleApply}>
            {t('apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
