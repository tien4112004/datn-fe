import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getGradeLabel } from '../../shared/utils/grades';
import type { Class } from '../../shared/types';

interface ClassOverviewProps {
  classData: Class;
  onEditClick: (classData: Class) => void;
}

export const ClassOverview = ({ classData, onEditClick }: ClassOverviewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('overview.basicInfo')}</h2>
          <p className="text-muted-foreground text-sm">{t('overview.subtitle')}</p>
        </div>
        <Button onClick={() => onEditClick(classData)} variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          {t('actions.edit')}
        </Button>
      </div>

      <Separator />

      {/* Content */}
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">{t('overview.className')}</label>
            <p className="text-sm">{classData.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">{t('overview.grade')}</label>
            <p className="text-sm">{getGradeLabel(classData.grade || classData.settings?.grade || 1)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">{t('academicYear')}</label>
            <p className="text-sm">{classData.academicYear}</p>
          </div>

          {classData.class && (
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">{t('class')}</label>
              <p className="text-sm">{classData.class}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">{t('overview.status')}</label>
            <p className="text-sm">{classData.isActive ? t('status.active') : t('status.inactive')}</p>
          </div>
        </div>

        {classData.description && (
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">{t('overview.description')}</label>
            <p className="text-sm leading-relaxed">{classData.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
