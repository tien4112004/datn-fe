import { useParams, useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useClassStore from '../shared/stores/classStore';
import { ClassDetailTabs } from './components/ClassDetailTabs';
import { useClass } from '../shared/hooks';
import type { Class } from '../shared/types';
import { useEffect } from 'react';
import { UpdateClassModal } from '../class-list/components/controls/UpdateClassModal';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';

interface LoaderData {
  class: Class;
}

export const ClassDetailPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const { t: tPage } = useTranslation('common', { keyPrefix: 'pages' });
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
      {/* Breadcrumb Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/classes">{tPage('classes')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentClass?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content with Sidebar */}
      {currentClass && (
        <ClassDetailTabs classId={id!} currentClass={currentClass} onEditClick={openEditModal} />
      )}

      {/* Edit Modal */}
      {currentClass && (
        <UpdateClassModal isOpen={isEditModalOpen} onClose={closeEditModal} initialData={currentClass} />
      )}
    </>
  );
};
