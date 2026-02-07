import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { QuestionBankItem } from '../../types';
import { VIEW_MODE } from '../../types';
import { QuestionTypeIcon, DifficultyBadge } from '@/features/question/components/shared';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/shared/components/ui/hover-card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { getGradeName, getSubjectI18nKey, getSubjectBadgeClass } from '@aiprimary/core';

interface QuestionBankCardProps {
  question: QuestionBankItem;
  isSelected: boolean;
  onToggleSelection: (question: QuestionBankItem) => void;
}

// Helper functions for colorful badges

export const QuestionBankCard = ({ question, isSelected, onToggleSelection }: QuestionBankCardProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { t: tCommon } = useTranslation(I18N_NAMESPACES.COMMON);

  const subjectName = tCommon(getSubjectI18nKey(question.subject) as any);

  return (
    <HoverCard openDelay={400} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'cursor-pointer rounded-xl border p-4',
            'transition-all duration-200',
            isSelected && 'border-primary bg-primary/5',
            !isSelected && 'border-border shadow-sm hover:shadow-md'
          )}
          onClick={() => onToggleSelection(question)}
        >
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
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="max-h-96 w-[28rem] p-0">
        <ScrollArea className="max-h-96 p-4">
          <QuestionRenderer question={question} viewMode={VIEW_MODE.VIEWING} compact />
        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  );
};
