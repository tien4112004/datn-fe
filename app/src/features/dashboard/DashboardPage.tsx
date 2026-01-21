import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClassListSimpleTable } from './components/ClassListSimpleTable';
import { DashboardCalendar } from './components/DashboardCalendar';
import { RecentDocuments } from './components/RecentDocuments';
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
    <div className="flex h-screen flex-col">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Main Content */}
        <div className="flex-1 space-y-8 overflow-y-auto p-8">
          {/* My Classes Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold">{t('myClasses.title')}</h1>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('myClasses.addClass')}
              </Button>
            </div>
            <ClassListSimpleTable />
          </div>

          {/* Recent Documents Section */}
          <RecentDocuments />
        </div>

        {/* Right Sidebar */}
        <div className="bg-muted/10 w-[380px] space-y-6 overflow-y-auto border-l p-6">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
};
