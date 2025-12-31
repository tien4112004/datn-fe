import { ClassForm } from './ClassForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateClass, type ClassSchema } from '@/features/classes/shared/hooks';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Class } from '@/features/classes/shared/types';
import { useClassStore } from '@/features/classes/shared/stores';

interface UpdateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Class;
}

export const UpdateClassModal = ({ isOpen, onClose, initialData }: UpdateClassModalProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'modals' });
  const updateClassMutation = useUpdateClass();
  const { closeEditModal } = useClassStore();

  const handleSubmit = async (data: ClassSchema) => {
    const toastId = toast.loading(t('updateClass.loading'));

    try {
      // Backend expects settings as a JSON string, not an object
      const settings: Record<string, any> = {};

      if (data.grade) settings.grade = data.grade;
      if (data.academicYear) settings.academicYear = data.academicYear;
      if (data.class) settings.class = data.class;

      const updateRequest = {
        id: initialData.id,
        name: data.name,
        description: data.description || null,
        // Stringify settings object to JSON string as backend expects String type
        settings: Object.keys(settings).length > 0 ? JSON.stringify(settings) : null,
      };

      await updateClassMutation.mutateAsync(updateRequest);
      toast.success(`Class "${data.name}" updated successfully.`, {
        id: toastId,
      });
      closeEditModal();
    } catch (error) {
      console.error('Failed to update class', error);
      toast.error(t('updateClass.error'), {
        id: toastId,
      });
    }
  };

  // Transform Class data to ClassSchema format for the form
  const formInitialData: ClassSchema = {
    name: initialData.name,
    grade: initialData.grade || initialData.settings?.grade || 1,
    academicYear: initialData.academicYear || initialData.settings?.academicYear || '',
    class: initialData.class || initialData.settings?.class,
    description: initialData.description !== null ? initialData.description : undefined,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ClassForm initialData={formInitialData} onSubmit={handleSubmit} isEditMode={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
