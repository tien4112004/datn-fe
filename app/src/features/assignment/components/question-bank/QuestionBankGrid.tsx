import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Loader2 } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useQuestionBankList } from '../../hooks/useQuestionBankApi';
import useQuestionBankStore from '../../stores/questionBankStore';
import { QuestionBankCard } from './QuestionBankCard';
import { getStaggerDelay } from '../../constants/animations';

export const QuestionBankGrid = () => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { filters, toggleQuestionSelection, isQuestionSelected } = useQuestionBankStore();

  // Fetch questions from API with current filters
  const { data, isLoading } = useQuestionBankList(filters);
  const questions = data?.questions || [];

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Empty state - no questions found
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('questionBank.empty.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('questionBank.empty.description')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="animate-in fade-in grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {questions.map((question, index) => (
        <div key={question.id} className={getStaggerDelay(index)}>
          <QuestionBankCard
            question={question}
            isSelected={isQuestionSelected(question.id)}
            onToggleSelection={toggleQuestionSelection}
          />
        </div>
      ))}
    </div>
  );
};
