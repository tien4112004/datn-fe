import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Question, ViewMode, Answer } from '../types';
import { VIEW_MODE } from '../types';
import { QuestionRenderer } from './QuestionRenderer';
import { QuestionTypeIcon } from './shared/QuestionTypeIcon';
import { DifficultyBadge } from './shared/DifficultyBadge';

interface QuestionCollectionItemProps {
  question: Question;
  questionNumber: number;
  viewMode: ViewMode;
  answer?: Answer;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete?: () => void;
  onChange?: (question: Question) => void;
  onAnswerChange?: (answer: Answer) => void;
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
}

export const QuestionCollectionItem = ({
  question,
  questionNumber,
  viewMode,
  answer,
  isExpanded,
  onToggleExpand,
  onDelete,
  onChange,
  onAnswerChange,
  onGradeChange,
}: QuestionCollectionItemProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isEditingMode = viewMode === VIEW_MODE.EDITING;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    disabled: !isEditingMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.();
  };

  return (
    <>
      <div ref={setNodeRef} style={style} id={`question-${question.id}`} className="scroll-mt-20">
        <Card className={cn('transition-shadow', isDragging && 'shadow-lg')}>
          {/* Question Header */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            {/* Drag Handle */}
            {isEditingMode && (
              <button
                {...attributes}
                {...listeners}
                className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
                aria-label={t('collection.item.dragToReorder')}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            )}

            {/* Question Number */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="text-sm font-semibold">
                {t('collection.item.questionNumber', { number: questionNumber })}
              </span>
              <QuestionTypeIcon type={question.type} className="h-3.5 w-3.5" />
              <DifficultyBadge difficulty={question.difficulty} className="text-xs" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Collapse/Expand Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onToggleExpand}
                aria-label={isExpanded ? t('collection.item.collapse') : t('collection.item.expand')}
              >
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>

              {/* Delete Button (Editing mode only) */}
              {isEditingMode && onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                  onClick={() => setShowDeleteDialog(true)}
                  aria-label={t('collection.item.delete')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Content */}
          {isExpanded && (
            <CardContent className="p-3">
              <QuestionRenderer
                question={question}
                viewMode={viewMode}
                answer={answer}
                onChange={onChange}
                onAnswerChange={onAnswerChange}
                onGradeChange={onGradeChange}
              />
            </CardContent>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('collection.item.deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('collection.item.deleteConfirm.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('collection.item.deleteConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('collection.item.deleteConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
