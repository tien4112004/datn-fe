import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Edit, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';

const ReadonlyField = ({
  label,
  value,
  emptyValue = '-',
}: {
  label: string;
  value?: string;
  emptyValue?: string;
}) => (
  <div className="space-y-1">
    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-sm text-gray-900 dark:text-gray-100">{value || emptyValue}</div>
  </div>
);

export const AssignmentMetadataPanel = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadata' });
  const { watch } = useFormContext<AssignmentFormData>();
  const setMetadataDialogOpen = useAssignmentEditorStore((state) => state.setMetadataDialogOpen);

  const title = watch('title');
  const subject = watch('subject');
  const grade = watch('grade');
  const description = watch('description');
  const shuffleQuestions = watch('shuffleQuestions');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-blue-500 p-2 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('panelTitle')}</h2>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setMetadataDialogOpen(true)}>
          <Edit className="mr-1 h-3 w-3" />
          {t('edit')}
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <ReadonlyField label={t('fields.title')} value={title} emptyValue={t('fields.emptyValue')} />
        <ReadonlyField label={t('fields.subject')} value={subject} emptyValue={t('fields.emptyValue')} />
        <ReadonlyField label={t('fields.grade')} value={grade} emptyValue={t('fields.emptyValue')} />
        {description && (
          <ReadonlyField
            label={t('fields.description')}
            value={description}
            emptyValue={t('fields.emptyValue')}
          />
        )}
        <ReadonlyField
          label={t('fields.shuffleQuestions')}
          value={
            shuffleQuestions ? t('fields.shuffleQuestionsEnabled') : t('fields.shuffleQuestionsDisabled')
          }
        />
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 dark:border-gray-700" />
    </div>
  );
};
