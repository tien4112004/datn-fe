import { useTranslation } from 'react-i18next';
import QuickActionsGrid from '../components/QuickActionsGrid';
import RecentProjects from '../components/RecentProjects';
import DashboardChat from '../components/DashboardChat';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb';
import { Separator } from '@/shared/components/ui/separator';

const DashboardPage = () => {
  const { t } = useTranslation('dashboard');

  return (
    <>
      {/* Header with breadcrumbs */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main content */}
      <div className="flex flex-col gap-6 p-6">
        {/* Welcome section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('welcome')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Quick Actions Grid */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t('quickActions.title')}</h2>
          <QuickActionsGrid />
        </section>

        {/* Two-column layout for Recent Projects and Chat */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">{t('recentProjects.title')}</h2>
            <RecentProjects />
          </section>

          {/* Dashboard Chat */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">{t('chat.title')}</h2>
            <DashboardChat />
          </section>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
