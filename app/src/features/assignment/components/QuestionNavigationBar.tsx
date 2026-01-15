import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { Question, Answer } from '../types';
import { getAnswerStats } from '../utils/collectionHelpers';

interface QuestionNavigationBarProps {
  questions: Question[];
  answers: Map<string, Answer>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const QuestionNavigationBar = ({
  questions,
  answers,
  currentIndex,
  onNavigate,
}: QuestionNavigationBarProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);
  const stats = getAnswerStats(questions, answers);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleQuestionClick = (index: number) => {
    onNavigate(index);
    // Scroll to question
    const element = document.getElementById(`question-${questions[index].id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-2">
      {/* Progress Indicator */}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{t('navigation.progress')}</span>
        <span className="font-medium">
          {stats.answered}/{stats.total}
        </span>
      </div>

      {/* Navigation Pills Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((question, index) => {
          const isAnswered = answers.has(question.id);
          const isCurrent = index === currentIndex;

          return (
            <button
              key={question.id}
              onClick={() => handleQuestionClick(index)}
              className={cn(
                'relative flex h-8 items-center justify-center rounded border text-xs font-medium transition-colors',
                isCurrent
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isAnswered
                    ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-background hover:bg-accent hover:text-accent-foreground'
              )}
              aria-label={
                isAnswered
                  ? t('navigation.questionAnswered', { number: index + 1 })
                  : t('navigation.questionLabel', { number: index + 1 })
              }
            >
              <span>{index + 1}</span>
              {isAnswered && !isCurrent && (
                <Check className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 text-green-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Prev/Next Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-8 flex-1"
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          {t('navigation.previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="h-8 flex-1"
        >
          {t('navigation.next')}
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
