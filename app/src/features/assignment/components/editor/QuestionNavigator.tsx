import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { List, FileText } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';

export const QuestionNavigator = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.navigator' });
  const { watch } = useFormContext<AssignmentFormData>();
  const questions = watch('questions');

  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const currentQuestionIndex = useAssignmentEditorStore((state) => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useAssignmentEditorStore((state) => state.setCurrentQuestionIndex);

  return (
    <CollapsibleSection
      title={`${questions.length} Question${questions.length !== 1 ? 's' : ''}`}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
    >
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
          // title={t('assignmentInfo', { defaultValue: 'Assignment Info' })}
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
              // title={question.title || t('untitled', { defaultValue: 'Untitled' })}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};
