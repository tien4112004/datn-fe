import { MOCK_RECENT_PROJECTS } from '../constants/mockData';
import RecentProjectCard from './RecentProjectCard';
import { useTranslation } from 'react-i18next';

const RecentProjects = () => {
  const { t } = useTranslation('dashboard');

  if (MOCK_RECENT_PROJECTS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground">{t('recentProjects.empty')}</p>
        <p className="text-muted-foreground text-sm">{t('recentProjects.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {MOCK_RECENT_PROJECTS.map((project) => (
        <RecentProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default RecentProjects;
