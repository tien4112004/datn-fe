import { useTranslation } from 'react-i18next';
import type { Class } from '../../shared/types';

interface ClassOverviewProps {
  classData: Class;
  onEditClick: (classData: Class) => void;
}

export const ClassOverview = ({ classData }: ClassOverviewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('overview.welcome')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('overview.welcomeSubtitle', { className: classData.name })}
        </p>
      </div>

      {/* Description */}
      {classData.description && (
        <div className="bg-muted/50 rounded-lg border p-6">
          <h3 className="mb-2 font-semibold">{t('overview.about')}</h3>
          <p className="text-muted-foreground leading-relaxed">{classData.description}</p>
        </div>
      )}

      {/* Quick Stats Placeholder */}
      <div className="text-muted-foreground text-sm">
        <p>{t('overview.quickStatsPlaceholder')}</p>
      </div>
    </div>
  );
};
