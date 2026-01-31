import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, GraduationCap, Calendar, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getGradeLabel } from '@/features/classes/shared/utils/grades';

import { FeedTab } from '@/features/classes/class-feed/components';
import { ClassStudentView } from '@/features/classes/class-student';
import type { Class } from '@/features/classes/shared/types';
import { LanguageSettingsDropdown } from '@/features/student/components/LanguageSettingsDropdown';

interface StudentClassDetailTabsProps {
  classId: string;
  currentClass: Class;
}

const tabs = [
  { value: 'feed', icon: MessageSquare, labelKey: 'tabs.feed' },
  { value: 'students', icon: Users, labelKey: 'tabs.students' },
] as const;

type StartTab = (typeof tabs)[number]['value'];

export const StudentClassDetailTabs = ({ classId, currentClass }: StudentClassDetailTabsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') || 'feed') as StartTab;

  const handleTabChange = (tab: StartTab) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="flex h-full flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      {/* Mobile Horizontal Tabs */}
      <div className="bg-background border-b md:hidden">
        <div className="border-b px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold">{currentClass.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                {currentClass.settings?.grade && (
                  <span className="text-muted-foreground text-xs">
                    {getGradeLabel(currentClass.settings.grade)}
                  </span>
                )}
              </div>
            </div>

            {/* Settings Dropdown */}
            <LanguageSettingsDropdown />
          </div>
        </div>

        <nav className="overflow-x-auto">
          <div className="flex min-w-max gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Vertical Sidebar */}
      <aside className="bg-muted/10 hidden overflow-y-auto border-r md:block md:w-64 lg:w-80">
        <div className="space-y-4 border-b p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{currentClass.name}</h1>
            </div>

            <LanguageSettingsDropdown />
          </div>

          <div className="text-muted-foreground space-y-2 text-sm">
            {currentClass.settings?.grade && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>{getGradeLabel(currentClass.settings.grade)}</span>
              </div>
            )}

            {currentClass.settings?.academicYear && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{currentClass.settings.academicYear}</span>
              </div>
            )}

            {currentClass.settings?.class && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Room:</span>
                <span>{currentClass.settings.class}</span>
              </div>
            )}
          </div>

          {currentClass.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{currentClass.description}</p>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'feed' && <FeedTab classId={classId} />}

        {currentTab === 'students' && (
          <div className="p-6">
            <ClassStudentView classData={currentClass} />
          </div>
        )}
      </main>
    </div>
  );
};
