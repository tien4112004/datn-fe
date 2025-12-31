import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Question, QuestionBankItem } from '../../types';
import { QUESTION_TYPE, BANK_TYPE } from '../../types';
import { QuestionTypeIcon } from '../shared/QuestionTypeIcon';
import { DifficultyBadge } from '../shared/DifficultyBadge';

interface QuestionBankCardProps {
  question: QuestionBankItem;
  isSelected: boolean;
  onToggleSelection: (question: Question) => void;
}

const getQuestionPreview = (question: Question): string => {
  const maxLength = 100;

  switch (question.type) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      if ('options' in question && question.options.length > 0) {
        const firstTwo = question.options.slice(0, 2).map((opt) => opt.text);
        return firstTwo.join(', ') + (question.options.length > 2 ? '...' : '');
      }
      return '';

    case QUESTION_TYPE.MATCHING:
      if ('pairs' in question) {
        return `${question.pairs.length} pairs to match`;
      }
      return '';

    case QUESTION_TYPE.OPEN_ENDED:
      if ('expectedAnswer' in question && question.expectedAnswer) {
        return (
          question.expectedAnswer.substring(0, maxLength) +
          (question.expectedAnswer.length > maxLength ? '...' : '')
        );
      }
      return 'Open-ended response required';

    case QUESTION_TYPE.FILL_IN_BLANK:
      if ('segments' in question && question.segments.length > 0) {
        const preview = question.segments
          .slice(0, 3)
          .map((seg) => (seg.type === 'text' ? seg.content : '[___]'))
          .join('');
        return preview.substring(0, maxLength) + (preview.length > maxLength ? '...' : '');
      }
      return '';

    default:
      return '';
  }
};

export const QuestionBankCard = ({ question, isSelected, onToggleSelection }: QuestionBankCardProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const preview = getQuestionPreview(question);
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
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'border-primary border-2',
        isApplicationQuestion && 'bg-accent/10'
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

          {/* Divider */}
          {preview && <div className="border-t" />}

          {/* Preview */}
          {preview && <div className="text-muted-foreground line-clamp-2 text-xs">{preview}</div>}

          {/* Footer: Points */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('questionBank.card.points', { points: question.points || 10 })}
            </span>
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
