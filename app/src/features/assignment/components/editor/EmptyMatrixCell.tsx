import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Difficulty, QuestionType } from '@aiprimary/core';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
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
    <div
      className="flex h-full min-h-[60px] items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCreate}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('tooltips.addCell')}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div className="h-8 w-8" />
      )}
    </div>
  );
};
