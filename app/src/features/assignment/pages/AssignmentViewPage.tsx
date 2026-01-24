import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAssignment, useDeleteAssignment } from '../hooks';
import { AssignmentViewerLayout } from '../components/viewer/AssignmentViewerLayout';
import { useState } from 'react';
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
import { toast } from 'sonner';

export const AssignmentViewPage = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'view' });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: assignment, isLoading, error } = useAssignment(id!);
  const deleteAssignment = useDeleteAssignment();

  const handleEdit = () => {
    navigate(`/assignments/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteAssignment.mutateAsync(id!);
      toast.success(t('deleteSuccess'));
      navigate('/projects');
    } catch {
      toast.error(t('deleteError'));
    }
    setIsDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('notFound')}</h2>
          <p className="text-muted-foreground">{t('notFoundDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        </div>

        <AssignmentViewerLayout
          assignment={assignment}
          onEdit={handleEdit}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('deleteDialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
