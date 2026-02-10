import * as React from 'react';
import { useNavigate, useParams, useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AssignmentEditorLayout } from '../components/editor/AssignmentEditorLayout';
import { MetadataEditDialog } from '../components/editor/MetadataEditDialog';
import { QuestionBankImportManager } from '../components/question-bank/QuestionBankImportManager';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { useAssignmentFormStore } from '../stores/useAssignmentFormStore';
import { useAssignmentDirtyState } from '../hooks/useAssignmentDirtyState';
import { useSaveAssignment } from '../hooks/useSaveAssignment';
import { createEmptyFormData, transformAssignmentToFormData } from '../api/service';
import { ERROR_TYPE } from '@/shared/constants';
import { CriticalError } from '@aiprimary/api';
import type { Assignment } from '@aiprimary/core';

export const AssignmentEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });

  // Get assignment from loader (edit mode) or null (create mode)
  const { assignment: assignmentData } = useLoaderData() as { assignment: Assignment | null };

  // If we are in edit mode and no assignment was loaded, throw a resource error
  if (id && assignmentData === null) {
    throw new CriticalError('Assignment data is unavailable', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const initialize = useAssignmentFormStore((state) => state.initialize);

  // Dirty state + unsaved changes blocking
  const { isDirty, markClean, saveSuccessRef, showDialog, setShowDialog, handleStay, handleProceed } =
    useAssignmentDirtyState();

  // Save logic
  const { save, isSaving } = useSaveAssignment({
    id,
    onSaveSuccess: () => {
      saveSuccessRef.current = true;
      markClean();
    },
    onSaveError: () => {
      saveSuccessRef.current = false;
    },
  });

  // Initialize form data
  React.useEffect(() => {
    if (id && assignmentData) {
      initialize(transformAssignmentToFormData(assignmentData));
      markClean();
    } else if (!id) {
      initialize(createEmptyFormData());
    }

    return () => {
      useAssignmentFormStore.getState().reset();
    };
  }, [id, assignmentData, initialize, markClean]);

  const handleCancel = () => {
    if (isDirty && !saveSuccessRef.current) {
      // Let the blocker handle this - trigger navigation which will show the dialog
      navigate('/projects?resource=assignment');
    } else {
      navigate('/projects?resource=assignment');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? t('pageTitle.edit') : t('pageTitle.create')}
          </h1>
        </div>

        <AssignmentEditorLayout onCancel={handleCancel} onSave={save} isSaving={isSaving} />

        {/* Dialogs */}
        <MetadataEditDialog />
        <QuestionBankImportManager />

        {/* Unsaved Changes Dialog */}
        <UnsavedChangesDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onStay={handleStay}
          onLeave={handleProceed}
        />
      </div>
    </div>
  );
};
