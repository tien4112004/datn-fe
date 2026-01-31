import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Settings, MessageSquare, GraduationCap, Calendar, Edit } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getGradeLabel } from '../../shared/utils/grades';

import { ClassStudentView } from '../../class-student';
import { ClassSettings } from './ClassSettings';
import { FeedTab } from '../../class-feed/components';
import type { Class } from '../../shared/types';
import type { ClassTabs } from '../../shared';

interface ClassDetailTabsProps {
  classId: string;
  currentClass: Class;
  onEditClick: (classData: Class) => void;
}

const tabs = [
  { value: 'feed', icon: MessageSquare, labelKey: 'tabs.feed' },
  { value: 'students', icon: Users, labelKey: 'tabs.students' },
  { value: 'settings', icon: Settings, labelKey: 'tabs.settings' },
] as const;

export const ClassDetailTabs = ({ classId, currentClass, onEditClick }: ClassDetailTabsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') || 'feed') as ClassTabs;

  const handleTabChange = (tab: ClassTabs) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="flex h-full flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      {/* Mobile Horizontal Tabs - Hidden on Desktop */}
      <div className="bg-background border-b md:hidden">
        {/* Compact Class Info */}
        <div className="border-b px-4 py-3">
          <h1 className="truncate text-lg font-semibold">{currentClass.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={currentClass.isActive ? 'default' : 'secondary'} className="text-xs">
              {currentClass.isActive ? t('status.active') : t('status.inactive')}
            </Badge>
            {currentClass.settings?.grade && (
              <span className="text-muted-foreground text-xs">
                {getGradeLabel(currentClass.settings.grade)}
              </span>
            )}
          </div>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <nav className="overflow-x-auto">
          <div className="flex min-w-max gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value as ClassTabs)}
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

      {/* Vertical Sidebar with Class Info */}
      <aside className="bg-muted/10 hidden overflow-y-auto border-r md:block md:w-64 lg:w-80">
        {/* Class Information Section */}
        <div className="space-y-4 border-b p-6">
          {/* Title and Status */}
          <div className="flex justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{currentClass.name}</h1>
              <Badge variant={currentClass.isActive ? 'default' : 'secondary'}>
                {currentClass.isActive ? t('status.active') : t('status.inactive')}
              </Badge>
            </div>

            {/* Edit Button */}
            <Button onClick={() => onEditClick(currentClass)} variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              {t('actions.edit')}
            </Button>
          </div>

          {/* Metadata */}
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

          {/* Description */}
          {currentClass.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{currentClass.description}</p>
          )}

          {/* Grade and academic year */}
          {currentClass.settings?.grade && currentClass.settings?.academicYear && (
            <div className="flex gap-2">
              <Badge>{getGradeLabel(currentClass.settings.grade)}</Badge>
              <Badge>{currentClass.settings.academicYear}</Badge>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value as ClassTabs)}
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

      {/* Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'feed' && <FeedTab classId={classId} />}

        {currentTab === 'students' && (
          <div className="p-6">
            <ClassStudentView classData={currentClass} />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="p-6">
            <ClassSettings classData={currentClass} />
          </div>
        )}
      </main>
    </div>
  );
};
