import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Question, QuestionBankItem } from '../../types';
import { QuestionTypeIcon, DifficultyBadge } from '@/features/question/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { getGradeName } from '@aiprimary/core';

interface QuestionBankCardProps {
  question: QuestionBankItem;
  isSelected: boolean;
  onToggleSelection: (question: Question) => void;
}

// Helper functions for colorful badges
const getSubjectBadgeClass = (subject: string) => {
  switch (subject) {
    case 'T': // Math
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'TV': // Vietnamese
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'TA': // English
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
};

export const QuestionBankCard = ({ question, isSelected, onToggleSelection }: QuestionBankCardProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);

  const getSubjectName = (subjectCode: 'T' | 'TV' | 'TA'): string => {
    switch (subjectCode) {
      case 'T':
        return t('questionBank.subjects.toan');
      case 'TV':
        return t('questionBank.subjects.tiengViet');
      case 'TA':
        return t('questionBank.subjects.tiengAnh');
    }
  };

  const subjectName = getSubjectName(question.subject);

  return (
    <Card
      className={cn(
        'cursor-pointer rounded-2xl border-2',
        'transition-all',
        'duration-200',
        isSelected && [
          'border-primary from-primary/10 bg-gradient-to-br to-transparent',
          'shadow-lg',
          'scale-[1.02]',
          'ring-primary/20 ring-2',
        ],
        !isSelected && [
          'border-border',
          'shadow-sm',
          'hover:scale-[1.01] hover:shadow-md',
          'active:scale-[0.99]',
        ]
      )}
      onClick={() => onToggleSelection(question)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Checkbox + Title */}
          <div className="flex items-start gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(question)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${question.title}`}
              className="mt-1"
            />
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-medium">
                {question.title || t('questionBank.card.untitled')}
              </h3>
            </div>
          </div>

          {/* Metadata: Subject + Grade + Type Icon + Difficulty Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs font-medium', getSubjectBadgeClass(question.subject))}
            >
              {subjectName}
            </Badge>
            {question.grade && (
              <Badge variant="outline" className="text-xs font-medium">
                {getGradeName(question.grade)}
              </Badge>
            )}
            <QuestionTypeIcon type={question.type} className="h-3.5 w-3.5" />
            <DifficultyBadge difficulty={question.difficulty} className="text-xs" />
          </div>

          {/* Footer: Selected status */}
          <div className="flex items-center justify-end text-xs">
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                {t('questionBank.card.selected')}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
