import { List, FileText, Grid3x3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { CollapsibleSection } from '../editor/CollapsibleSection';
import { useAssignmentViewerStore } from '../../stores/useAssignmentViewerStore';
import type { Assignment } from '../../types';

interface QuestionViewNavigatorProps {
  assignment: Assignment;
}

export const QuestionViewNavigator = ({ assignment }: QuestionViewNavigatorProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.navigator' });

  const mainView = useAssignmentViewerStore((state) => state.mainView);
  const currentQuestionId = useAssignmentViewerStore((state) => state.currentQuestionId);
  const setMainView = useAssignmentViewerStore((state) => state.setMainView);
  const setCurrentQuestionId = useAssignmentViewerStore((state) => state.setCurrentQuestionId);

  const questions = assignment.questions || [];

  const handleQuestionClick = (questionId: string) => {
    setMainView('questions');
    setCurrentQuestionId(questionId);
  };

  return (
    <CollapsibleSection
      title={t('questionsCount', { count: questions.length })}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
    >
      <div className="grid grid-cols-5 gap-1.5 overflow-hidden">
        {/* Assignment Info Icon */}
        <button
          type="button"
          onClick={() => setMainView('info')}
          className={cn(
            'flex h-8 w-full items-center justify-center rounded text-xs transition-colors',
            mainView === 'info'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          )}
          title={t('assignmentInfo')}
        >
          <FileText className="h-3 w-3" />
        </button>

        {/* Matrix Viewer Icon */}
        <button
          type="button"
          onClick={() => setMainView('matrix')}
          className={cn(
            'flex h-8 w-full items-center justify-center rounded text-xs transition-colors',
            mainView === 'matrix'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          )}
          title={t('matrixBuilder')}
        >
          <Grid3x3 className="h-3 w-3" />
        </button>

        {/* Question Numbers */}
        {questions.map((aq, index) => {
          const question = 'question' in aq ? aq.question : (aq as any);
          const isActive = mainView === 'questions' && currentQuestionId === question.id;
          const hasTitle = Boolean(question.title) && question.title.trim() !== '';

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => handleQuestionClick(question.id)}
              className={cn(
                'flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : hasTitle
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
              title={question.title || 'Untitled'}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};
