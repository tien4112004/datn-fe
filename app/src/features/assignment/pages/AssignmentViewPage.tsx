import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/alert-dialog';
import { ERROR_TYPE } from '@/shared/constants';
import { CriticalError } from '@aiprimary/api';
import type { Assignment } from '@aiprimary/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@ui/button';
import { toast } from 'sonner';
import { AssignmentViewerLayout } from '../components/viewer/AssignmentViewerLayout';
import { useDeleteAssignment } from '../hooks';

export const AssignmentViewPage = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'view' });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get assignment from loader
  const { assignment } = useLoaderData() as { assignment: Assignment | null };

  // If no assignment was loaded, throw a resource error
  if (assignment === null) {
    throw new CriticalError('Assignment data is unavailable', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const deleteAssignment = useDeleteAssignment();

  const handleEdit = () => {
    navigate(`/assignment/edit/${id}`);
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

  return (
    <div className="flex h-[100dvh] flex-col bg-white dark:bg-gray-950">
      <div className="flex shrink-0 items-center justify-between px-8 pb-4 pt-8">
        {/* Page Header */}
        <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <Button size="icon" variant="outline" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 px-8 pb-4">
        <AssignmentViewerLayout
          assignment={assignment}
          onEdit={handleEdit}
          onDelete={() => setIsDeleteDialogOpen(true)}
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={setSidebarOpen}
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
