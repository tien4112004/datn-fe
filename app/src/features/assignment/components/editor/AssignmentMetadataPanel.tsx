import { useFormContext } from 'react-hook-form';
import { Edit, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';

const ReadonlyField = ({ label, value }: { label: string; value?: string }) => (
  <div className="space-y-1">
    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-sm text-gray-900 dark:text-gray-100">{value || '-'}</div>
  </div>
);

export const AssignmentMetadataPanel = () => {
  const { watch } = useFormContext<AssignmentFormData>();
  const setMetadataDialogOpen = useAssignmentEditorStore((state) => state.setMetadataDialogOpen);

  const title = watch('title');
  const subject = watch('subject');
  const grade = watch('grade');
  const description = watch('description');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-500 p-2 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assignment Info</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => setMetadataDialogOpen(true)}>
          <Edit className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <ReadonlyField label="Title" value={title} />
        <ReadonlyField label="Subject" value={subject} />
        <ReadonlyField label="Grade" value={grade} />
        {description && <ReadonlyField label="Description" value={description} />}
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 dark:border-gray-700" />
    </div>
  );
};
