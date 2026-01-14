import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClass } from '@/features/classes/shared/hooks';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { StudentClassDetailTabs } from './StudentClassDetailTabs';

export const StudentClassDetailPage = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const { id } = useParams<{ id: string }>();

  const { data: currentClass, isLoading } = useClass(id!);

  if (isLoading) {
    return <GlobalSpinner />;
  }

  if (!currentClass) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('notFound')}</h2>
          <p className="text-muted-foreground">{t('notFoundDescription')}</p>
        </div>
      </div>
    );
  }

  return <StudentClassDetailTabs classId={id!} currentClass={currentClass} />;
};
