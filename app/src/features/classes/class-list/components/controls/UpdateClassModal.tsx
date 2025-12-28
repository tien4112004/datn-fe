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
      await updateClassMutation.mutateAsync({ ...data, id: initialData.id });
      toast.success(t('updateClass.success', { name: data.name }), {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ClassForm initialData={initialData} onSubmit={handleSubmit} isEditMode={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
