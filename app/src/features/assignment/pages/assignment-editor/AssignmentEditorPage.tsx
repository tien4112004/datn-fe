import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useAssignmentEditorStore from '@/features/assignment/stores/assignmentEditorStore';
import {
  useAssignment,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  usePublishAssignment,
} from '@/features/assignment/hooks/useAssignmentApi';
import {
  AssignmentMetadataForm,
  QuestionCollectionSection,
} from '@/features/assignment/components/assignment-editor';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import {
  validateAssignmentMetadata,
  canPublishAssignment,
  calculateTotalPoints,
} from '@/features/assignment/utils/assignmentHelpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

export function AssignmentEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor',
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const {
    currentAssignment,
    questions,
    hasUnsavedChanges,
    loadAssignment,
    createNewAssignment,
    resetEditor,
    markSaved,
  } = useAssignmentEditorStore();

  // Fetch assignment if editing
  const { data: assignment } = useAssignment(id || '');

  // Mutations
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();
  const publishMutation = usePublishAssignment();

  const isEditMode = !!id;
  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    publishMutation.isPending;

  // Load assignment on mount (edit mode)
  useEffect(() => {
    if (assignment) {
      loadAssignment(assignment);
    } else if (!id) {
      // Create mode - initialize with default classId
      createNewAssignment('class-1');
    }
  }, [assignment, id, loadAssignment, createNewAssignment]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveDraft = async () => {
    // Validate metadata
    const errors = validateAssignmentMetadata(currentAssignment || {});
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          data: {
            id,
            title: currentAssignment?.title,
            description: currentAssignment?.description,
            dueDate: currentAssignment?.dueDate,
            questions: questions,
            totalPoints: calculateTotalPoints(questions),
          },
        });
      } else {
        const created = await createMutation.mutateAsync({
          classId: currentAssignment?.classId || '',
          title: currentAssignment?.title || '',
          description: currentAssignment?.description,
          dueDate: currentAssignment?.dueDate,
          questions: questions,
          totalPoints: calculateTotalPoints(questions),
        });
        // Redirect to edit mode with new ID
        navigate(`/assignments/edit/${created.id}`, { replace: true });
      }

      markSaved();
      toast.success(t('toast.draftSaved'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handlePublish = async () => {
    const publishCheck = canPublishAssignment(currentAssignment || {}, questions);

    if (!publishCheck.canPublish) {
      publishCheck.reasons.forEach((reason) => toast.error(reason));
      return;
    }

    try {
      if (isEditMode && id) {
        // Update then publish
        await updateMutation.mutateAsync({
          id,
          data: {
            id,
            title: currentAssignment?.title,
            description: currentAssignment?.description,
            dueDate: currentAssignment?.dueDate,
            questions: questions,
            totalPoints: calculateTotalPoints(questions),
          },
        });
        await publishMutation.mutateAsync(id);
      } else {
        // Create as published then mark as published
        const created = await createMutation.mutateAsync({
          classId: currentAssignment?.classId || '',
          title: currentAssignment?.title || '',
          description: currentAssignment?.description,
          dueDate: currentAssignment?.dueDate,
          questions: questions,
          totalPoints: calculateTotalPoints(questions),
        });
        await publishMutation.mutateAsync(created.id);
      }

      markSaved();
      toast.success(t('toast.published'));
      navigate('/assignments');
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t('toast.deleted'));
      resetEditor();
      navigate('/assignments');
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      resetEditor();
      navigate('/assignments');
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isLoading}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="scroll-m-20 text-balance text-4xl font-bold tracking-tight">
              {isEditMode ? t('editAssignment') : t('createNew')}
            </h1>
            {hasUnsavedChanges && <p className="mt-1 text-sm text-amber-600">Unsaved changes</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t('actions.delete')}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {t('actions.saveDraft')}
          </Button>

          <Button size="sm" onClick={handlePublish} disabled={isLoading} className="gap-2">
            <Send className="h-4 w-4" />
            {t('actions.publish')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <AssignmentMetadataForm />
        <QuestionCollectionSection />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetEditor();
                navigate('/assignments');
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
