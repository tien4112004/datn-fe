import { List, FileText, ListOrdered } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { CollapsibleSection } from './CollapsibleSection';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

export const QuestionNavigator = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.navigator' });

  // Get data from store
  const questions = useAssignmentFormStore((state) => state.questions);

  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const currentQuestionIndex = useAssignmentEditorStore((state) => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useAssignmentEditorStore((state) => state.setCurrentQuestionIndex);
  const setQuestionListDialogOpen = useAssignmentEditorStore((state) => state.setQuestionListDialogOpen);

  return (
    <CollapsibleSection
      title={t('questionsCount', { count: questions.length })}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
    >
      {/* List View Button */}
      {questions.length > 0 && (
        <div className="mb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setQuestionListDialogOpen(true)}
          >
            <ListOrdered className="mr-2 h-4 w-4" />
            {t('listView')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5">
        {/* Assignment Info Icon */}
        <button
          type="button"
          onClick={() => setMainView('info')}
          className={`flex h-8 w-full items-center justify-center rounded text-xs transition-colors ${
            mainView === 'info'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          title={t('assignmentInfo')}
        >
          <FileText className="h-3 w-3" />
        </button>

        {/* Question Numbers */}
        {questions.map((aq, index) => {
          const isActive = mainView === 'questions' && currentQuestionIndex === index;
          const question = aq.question;
          const hasTitle = question.title && question.title.trim() !== '';

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => {
                setMainView('questions');
                setCurrentQuestionIndex(index);
              }}
              className={`flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : hasTitle
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
              title={question.title || t('untitled')}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};
