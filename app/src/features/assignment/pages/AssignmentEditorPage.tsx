import * as React from 'react';
import { useNavigate, useParams, useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { Button } from '@ui/button';
import { AssignmentEditorLayout } from '../components/editor/AssignmentEditorLayout';
import { MetadataEditDialog } from '../components/editor/metadata/MetadataEditDialog';
import { QuestionBankImportManager } from '../components/editor/questions/QuestionBankImportManager';
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
  const { markClean, saveSuccessRef, showDialog, setShowDialog, handleStay, handleProceed } =
    useAssignmentDirtyState();

  // Save logic
  const { save, saveAndExit, isSaving } = useSaveAssignment({
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
    } else {
      initialize(createEmptyFormData());
    }

    return () => {
      useAssignmentFormStore.getState().reset();
    };
  }, [id, assignmentData, initialize, markClean]);

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleCancel = () => {
    if (id) {
      navigate(`/assignment/${id}`);
    } else {
      navigate('/projects?resource=assignment');
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-white dark:bg-gray-950">
      <div className="flex shrink-0 items-center justify-between px-8 pb-4 pt-8">
        {/* Page Header */}
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? t('pageTitle.edit') : t('pageTitle.create')}
        </h1>
        <Button size="icon" variant="outline" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 px-8 pb-4">
        <AssignmentEditorLayout
          onCancel={handleCancel}
          onSave={save}
          onSaveAndExit={saveAndExit}
          isSaving={isSaving}
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={setSidebarOpen}
        />
      </div>

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
  );
};
