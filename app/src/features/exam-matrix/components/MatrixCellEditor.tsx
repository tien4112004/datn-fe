import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { MatrixCell, Topic } from '@/features/exam-matrix/types';
import type { Difficulty } from '@/features/assignment/types';
import { Badge } from '@/shared/components/ui/badge';

interface MatrixCellEditorProps {
  open: boolean;
  cell: MatrixCell | null;
  topic: Topic | null;
  difficulty: Difficulty | null;
  onSave: (cell: MatrixCell) => void;
  onClear: () => void;
  onClose: () => void;
}

export const MatrixCellEditor = ({
  open,
  cell,
  topic,
  difficulty,
  onSave,
  onClear,
  onClose,
}: MatrixCellEditorProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);

  const [questionCount, setQuestionCount] = useState<number>(0);
  const [pointsPerQuestion, setPointsPerQuestion] = useState<number>(0);

  useEffect(() => {
    if (open && cell) {
      setQuestionCount(cell.requiredQuestionCount);
      setPointsPerQuestion(cell.pointsPerQuestion);
    } else {
      setQuestionCount(0);
      setPointsPerQuestion(0);
    }
  }, [open, cell]);

  const totalPoints = questionCount * pointsPerQuestion;

  const handleSave = () => {
    if (!topic || !difficulty) return;

    const updatedCell: MatrixCell = {
      id: cell?.id || `${topic.id}-${difficulty}`,
      topicId: topic.id,
      difficulty,
      requiredQuestionCount: questionCount,
      pointsPerQuestion,
    };

    onSave(updatedCell);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  if (!topic || !difficulty) return null;

  const getDifficultyLabel = (diff: Difficulty) => {
    const labels: Record<Difficulty, string> = {
      nhan_biet: t('difficulty.easy'),
      thong_hieu: t('difficulty.medium'),
      van_dung: t('difficulty.hard'),
      van_dung_cao: t('difficulty.van_dung_cao'),
    };
    return labels[diff];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('builder.cell.editTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cell Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{t('builder.cell.topic')}:</span>
              <span className="font-medium">{topic.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{t('builder.cell.difficulty')}:</span>
              <Badge variant="outline">{getDifficultyLabel(difficulty)}</Badge>
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label htmlFor="question-count">{t('builder.cell.questionCount')}</Label>
            <Input
              id="question-count"
              type="number"
              min="0"
              step="1"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder={t('builder.cell.questionCountPlaceholder')}
            />
          </div>

          {/* Points Per Question */}
          <div className="space-y-2">
            <Label htmlFor="points-per-question">{t('builder.cell.pointsPerQuestion')}</Label>
            <Input
              id="points-per-question"
              type="number"
              min="0"
              step="0.5"
              value={pointsPerQuestion}
              onChange={(e) => setPointsPerQuestion(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder={t('builder.cell.pointsPerQuestionPlaceholder')}
            />
          </div>

          {/* Total Points Display */}
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('builder.cell.totalPoints')}</span>
              <span className="text-lg font-bold">{totalPoints.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {cell && (
            <Button variant="destructive" onClick={handleClear} className="mr-auto">
              {t('builder.cell.clear')}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t('builder.cell.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={questionCount <= 0 || pointsPerQuestion <= 0}>
            {t('builder.cell.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
