import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { EditableContextDisplay } from './EditableContextDisplay';
import type { AssignmentContext, AssignmentQuestionWithTopic } from '../../types';

interface ContextListDisplayProps {
  contexts: AssignmentContext[];
  questions: AssignmentQuestionWithTopic[];
  readOnly?: boolean;
  onUpdate?: (contextId: string, updates: Partial<AssignmentContext>) => void;
  onDelete?: (context: { id: string; title: string }) => void;
}

export const ContextListDisplay = ({
  contexts,
  questions,
  readOnly = false,
  onUpdate,
  onDelete,
}: ContextListDisplayProps) => {
  const { t } = useTranslation('assignment', {
    keyPrefix: 'assignmentEditor.contextsPanel',
  });

  const getReferencingQuestionCount = (contextId: string) =>
    questions.filter((q) => q.question.contextId === contextId).length;

  if (contexts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500">{t('emptyState')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contexts.map((context) => {
        const refCount = getReferencingQuestionCount(context.id);
        return (
          <EditableContextDisplay
            key={context.id}
            context={context}
            refCount={refCount}
            readOnly={readOnly}
            onDelete={onDelete ? () => onDelete({ id: context.id, title: context.title }) : undefined}
            onUpdate={onUpdate ? (updates) => onUpdate(context.id, updates) : () => {}}
          />
        );
      })}
    </div>
  );
};
