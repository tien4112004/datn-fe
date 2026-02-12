import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { ClassListSimpleTable } from './components/ClassListSimpleTable';
import { EnhancedCalendar } from './components/EnhancedCalendar';
import { QuickNavigation } from './components/QuickNavigation';
import { RecentDocuments } from './components/RecentDocuments';
import { SummaryMetrics } from './components/SummaryMetrics';
import { useAuth } from '@/shared/context/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  // Redirect students to student view
  useEffect(() => {
    if (user?.role === 'student') {
      navigate('/student', { replace: true });
    }
  }, [user?.role, navigate]);

  // Don't render dashboard for students (they'll be redirected)
  if (user?.role === 'student') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Left Main Content */}
        <div className="flex-1 space-y-6 p-4 sm:space-y-8 sm:p-6 lg:overflow-y-auto lg:p-8">
          {/* Dashboard Header */}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Summary Metrics */}
          <SummaryMetrics />

          {/* Quick Navigation Section */}
          <QuickNavigation />

          {/* Recent Documents Section */}
          <RecentDocuments />
        </div>

        {/* Right Sidebar */}
        <div className="bg-muted/10 w-full space-y-6 border-t p-4 sm:p-6 lg:w-[380px] lg:overflow-y-auto lg:border-l lg:border-t-0">
          <EnhancedCalendar />

          {/* My Classes Section */}
          <div className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <h2 className="text-lg font-semibold">{t('myClasses.title')}</h2>
              <Button size="sm" className="w-full gap-1 sm:w-auto">
                <Plus className="h-3 w-3" />
                {t('myClasses.addClass')}
              </Button>
            </div>
            <ClassListSimpleTable />
          </div>
        </div>
      </div>
    </div>
  );
};
