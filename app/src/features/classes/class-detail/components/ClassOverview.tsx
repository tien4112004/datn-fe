import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../shared/types';

interface ClassOverviewProps {
  classData: Class;
  onEditClick: (classData: Class) => void;
}

export const ClassOverview = ({ classData, onEditClick }: ClassOverviewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t('overview.basicInfo')}</CardTitle>
          <Button onClick={() => onEditClick(classData)} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            {t('actions.edit')}
          </Button>
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
            {classData.class && (
              <div>
                <label className="text-muted-foreground text-sm font-medium">{t('class')}</label>
                <p className="text-sm">{classData.class}</p>
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
