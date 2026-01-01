import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { questionBankData } from '../../api/data/questionBank.data';
import useQuestionBankStore from '../../stores/questionBankStore';
import { QuestionBankCard } from './QuestionBankCard';
import { getStaggerDelay } from '../../constants/animations';

export const QuestionBankGrid = () => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const { filters, toggleQuestionSelection, isQuestionSelected } = useQuestionBankStore();

  // Apply filters to question bank data
  const filteredQuestions = useMemo(() => {
    let result = questionBankData;

    // Search filter (case-insensitive, searches title)
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter((q) => q.title.toLowerCase().includes(search));
    }

    // Type filter
    if (filters.questionType) {
      result = result.filter((q) => q.type === filters.questionType);
    }

    // Difficulty filter
    if (filters.difficulty) {
      result = result.filter((q) => q.difficulty === filters.difficulty);
    }

    // Subject filter
    if (filters.subjectCode) {
      result = result.filter((q) => q.subjectCode === filters.subjectCode);
    }

    return result;
  }, [filters]);

  // Empty state - no questions match filters
  if (filteredQuestions.length === 0) {
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
      {filteredQuestions.map((question, index) => (
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
