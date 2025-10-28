import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../types';

interface ClassOverviewProps {
  classData: Class;
}

const ClassOverview = ({ classData }: ClassOverviewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('overview.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-muted-foreground text-sm font-medium">{t('overview.className')}</label>
              <p className="text-sm">{classData.name}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">{t('overview.grade')}</label>
              <p className="text-sm">Grade {classData.grade}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">{t('academicYear')}</label>
              <p className="text-sm">{classData.academicYear}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">{t('overview.capacity')}</label>
              <p className="text-sm">
                {classData.currentEnrollment}/{classData.capacity}
              </p>
            </div>
            {classData.classroom && (
              <div>
                <label className="text-muted-foreground text-sm font-medium">{t('classroom')}</label>
                <p className="text-sm">{classData.classroom}</p>
              </div>
            )}
            <div>
              <label className="text-muted-foreground text-sm font-medium">{t('overview.status')}</label>
              <p className="text-sm">{classData.isActive ? t('status.active') : t('status.inactive')}</p>
            </div>
          </div>
          {classData.description && (
            <div>
              <label className="text-muted-foreground text-sm font-medium">{t('overview.description')}</label>
              <p className="mt-1 text-sm">{classData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassOverview;
