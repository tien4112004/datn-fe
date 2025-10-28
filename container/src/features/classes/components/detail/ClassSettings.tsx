import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../types';

interface ClassSettingsProps {
  classData: Class;
}

const ClassSettings = ({ classData }: ClassSettingsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{t('settings.status')}</h4>
            <p className="text-muted-foreground text-sm">
              {t('settings.currentStatus')}: {classData.isActive ? t('status.active') : t('status.inactive')}
            </p>
            <Button variant="outline" size="sm">
              {classData.isActive ? t('settings.deactivateClass') : t('settings.activateClass')}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">{t('settings.capacityManagement')}</h4>
            <p className="text-muted-foreground text-sm">
              {t('settings.currentCapacity')}: {classData.capacity} {t('settings.students')}
            </p>
            <Button variant="outline" size="sm">
              {t('settings.updateCapacity')}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">{t('academicYear')}</h4>
            <p className="text-muted-foreground text-sm">
              {t('settings.currentAcademicYear')}: {classData.academicYear}
            </p>
            <Button variant="outline" size="sm">
              {t('settings.changeAcademicYear')}
            </Button>
          </div>

          <div className="space-y-2 border-t pt-4">
            <h4 className="text-destructive font-medium">{t('settings.dangerZone')}</h4>
            <p className="text-muted-foreground text-sm">{t('settings.deleteWarning')}</p>
            <Button variant="destructive" size="sm">
              {t('settings.deleteClass')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassSettings;
