import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { PageContainer } from '@/shared/components/common/PageContainer';
import { useEffect, useRef } from 'react';
import { useClassStore } from '../shared/stores';
import { AddClassModal } from './components/controls/AddClassModal';
import { UpdateClassModal } from './components/controls/UpdateClassModal';
import { StudentFormDialog } from '../class-student/components/list-view/StudentFormDialog';
import { ClassFilters } from './components/ClassFilters';
import { ClassTable } from './components/ClassTable';
import type { Class } from '../shared/types';

export const ClassListPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'list' });

  // Use selectors to prevent unnecessary re-renders
  const openCreateModal = useClassStore((state) => state.openCreateModal);
  const closeCreateModal = useClassStore((state) => state.closeCreateModal);
  const isCreateModalOpen = useClassStore((state) => state.isCreateModalOpen);
  const isEditModalOpen = useClassStore((state) => state.isEditModalOpen);
  const closeEditModal = useClassStore((state) => state.closeEditModal);
  const isEnrollmentModalOpen = useClassStore((state) => state.isEnrollmentModalOpen);
  const closeEnrollmentModal = useClassStore((state) => state.closeEnrollmentModal);
  const selectedClass = useClassStore((state) => state.selectedClass);

  // Keep a ref of the last selected class to prevent unmounting during Dialog close animation
  const lastSelectedClassRef = useRef<Class | null>(null);

  useEffect(() => {
    if (selectedClass) {
      lastSelectedClassRef.current = selectedClass;
    }
  }, [selectedClass]);

  const classForModals = selectedClass || lastSelectedClassRef.current;

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createClass')}
          </Button>
        }
      />

      {/* Modals */}
      <AddClassModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
      {classForModals && (
        <>
          <UpdateClassModal isOpen={isEditModalOpen} onClose={closeEditModal} initialData={classForModals} />
          <StudentFormDialog
            open={isEnrollmentModalOpen}
            onOpenChange={(open) => !open && closeEnrollmentModal()}
            classId={classForModals.id}
            mode="create"
          />
        </>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <ClassFilters />
        </div>
      </div>

      <ClassTable />
    </PageContainer>
  );
};
