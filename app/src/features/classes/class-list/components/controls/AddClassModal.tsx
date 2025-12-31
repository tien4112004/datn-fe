import { ClassForm } from './ClassForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateClass } from '@/features/classes/shared/hooks';
import useClassStore from '@/features/classes/shared/stores/classStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ClassSchema } from '@/features/classes/shared/hooks/useClassForm';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClassModal = ({ isOpen, onClose }: AddClassModalProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'modals' });
  const createClassMutation = useCreateClass();
  const { closeCreateModal } = useClassStore();

  const handleSubmit = async (data: ClassSchema) => {
    const toastId = toast.loading(t('addClass.loading'));

    try {
      await createClassMutation.mutateAsync(data);
      toast.success(t('addClass.success', { name: data.name }), {
        id: toastId,
      });
      closeCreateModal();
    } catch (error) {
      console.error('Failed to add class', error);
      toast.error(t('addClass.error'), {
        id: toastId,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('addTitle')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ClassForm onSubmit={handleSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
