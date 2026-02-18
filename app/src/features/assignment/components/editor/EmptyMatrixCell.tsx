import { Button } from '@ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Difficulty, QuestionType } from '@aiprimary/core';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

interface EmptyMatrixCellProps {
  topicId: string;
  topicName: string;
  difficulty: Difficulty;
  questionType: QuestionType;
}

export const EmptyMatrixCell = ({ topicId, topicName, difficulty, questionType }: EmptyMatrixCellProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.matrixBuilder',
  });
  const createMatrixCell = useAssignmentFormStore((state) => state.createMatrixCell);

  const handleCreate = () => {
    createMatrixCell({
      topicId,
      topicName,
      difficulty,
      questionType,
      requiredCount: 1, // Start with 1 as default
    });
  };

  return (
    <div className="group flex h-full min-h-[60px] items-center justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleCreate}
            className="pointer-events-none h-8 w-8 p-0 opacity-0 transition-opacity duration-200 hover:bg-gray-200 group-hover:pointer-events-auto group-hover:opacity-100 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('tooltips.addCell')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
