import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useUpdateClass, useDeleteClass } from '../../shared/hooks/useApi';
import type { Class } from '../../shared/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { useState } from 'react';

interface ClassSettingsProps {
  classData: Class;
}

export const ClassSettings = ({ classData }: ClassSettingsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();

  const handleToggleClassStatus = () => {
    updateClassMutation.mutate(
      {
        id: classData.id,
        isActive: !classData.isActive,
      },
      {
        onSuccess: () => {
          toast.success(
            classData.isActive ? t('settings.deactivatedSuccess') : t('settings.activatedSuccess')
          );
        },
      }
    );
  };

  const handleDeleteClass = () => {
    deleteClassMutation.mutate(classData.id, {
      onSuccess: () => {
        toast.success(t('settings.deletedSuccess'));
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{t('settings.status')}</h4>
            <p className="text-muted-foreground text-sm">
              {t('settings.currentStatus')}: {classData.isActive ? t('status.active') : t('status.inactive')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleClassStatus}
              disabled={updateClassMutation.isPending}
            >
              {updateClassMutation.isPending
                ? t('settings.updating')
                : classData.isActive
                  ? t('settings.deactivateClass')
                  : t('settings.activateClass')}
            </Button>
          </div>

          <div className="space-y-2 border-t pt-4">
            <h4 className="text-destructive font-medium">{t('settings.dangerZone')}</h4>
            <p className="text-muted-foreground text-sm">{t('settings.deleteWarning')}</p>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deleteClassMutation.isPending}>
                  {deleteClassMutation.isPending ? t('settings.deleting') : t('settings.deleteClass')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.deleteClass')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.deleteWarning')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteClass}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteClassMutation.isPending ? t('settings.deleting') : t('settings.deleteClass')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
