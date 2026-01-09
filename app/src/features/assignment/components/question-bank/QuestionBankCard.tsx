import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Question, QuestionBankItem } from '../../types';
import { BANK_TYPE } from '../../types';
import { QuestionTypeIcon } from '../shared/QuestionTypeIcon';
import { DifficultyBadge } from '../shared/DifficultyBadge';
import { Card, CardContent } from '@/components/ui/card';

interface QuestionBankCardProps {
  question: QuestionBankItem;
  isSelected: boolean;
  onToggleSelection: (question: Question) => void;
}

export const QuestionBankCard = ({ question, isSelected, onToggleSelection }: QuestionBankCardProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const isApplicationQuestion = question.bankType === BANK_TYPE.APPLICATION;

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

  const subjectName = getSubjectName(question.subjectCode);

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
        ],
        isApplicationQuestion && !isSelected && 'bg-accent/10'
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
              <div className="flex items-center gap-2">
                <h3 className="line-clamp-2 flex-1 text-sm font-medium">
                  {question.title || 'Untitled Question'}
                </h3>
                {isApplicationQuestion && (
                  <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    {t('questionBank.card.applicationBadge')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Metadata: Subject + Type Icon + Difficulty Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              {subjectName}
            </Badge>
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
