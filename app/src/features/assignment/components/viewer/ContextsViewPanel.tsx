import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { ContextListDisplay } from '../context/ContextListDisplay';
import type { Assignment, AssignmentQuestionWithTopic, AssignmentContext } from '../../types';

interface ContextsViewPanelProps {
  assignment: Assignment;
}

export const ContextsViewPanel = ({ assignment }: ContextsViewPanelProps) => {
  const { t } = useTranslation('assignment', {
    keyPrefix: 'assignmentEditor.contextsPanel',
  });

  const contexts = ((assignment as any).contexts || []) as AssignmentContext[];
  const questions = (assignment.questions || []) as AssignmentQuestionWithTopic[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('panelTitle')}</h2>
      </div>

      <ContextListDisplay contexts={contexts} questions={questions} readOnly />
    </div>
  );
};
