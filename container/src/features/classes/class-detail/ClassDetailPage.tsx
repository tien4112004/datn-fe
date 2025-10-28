import { useParams, useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useClassStore from '../shared/stores/classStore';
import { ClassDetailHeader } from './components/ClassDetailHeader';
import { ClassDetailTabs } from './components/ClassDetailTabs';
import { useClass } from '../shared/hooks';
import type { Class } from '../shared/types';
import { useEffect } from 'react';
import { UpdateClassModal } from '../class-list/components/controls/UpdateClassModal';

interface LoaderData {
  class: Class;
}

export const ClassDetailPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const { id } = useParams<{ id: string }>();
  const loaderData = useLoaderData() as LoaderData;

  const { isEditModalOpen, closeEditModal, openEditModal, setSelectedClass } = useClassStore();

  // Use React Query for real-time updates, fallback to loader data
  const { data: classData, isLoading } = useClass(id!);
  const currentClass = classData || loaderData.class;
  // Set selected class in store
  useEffect(() => {
    setSelectedClass(currentClass);
  }, [currentClass, setSelectedClass]);

  if (!currentClass && !isLoading) {
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
    <>
      {currentClass && (
        <>
          <ClassDetailHeader currentClass={currentClass} />
          <ClassDetailTabs classId={id!} currentClass={currentClass} onEditClick={openEditModal} />
        </>
      )}
      {currentClass && (
        <UpdateClassModal isOpen={isEditModalOpen} onClose={closeEditModal} initialData={currentClass} />
      )}
    </>
  );
};
