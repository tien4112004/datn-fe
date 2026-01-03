import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, Users, Settings, MessageSquare, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getGradeLabel } from '../../shared/utils/grades';

import { ClassOverview } from './ClassOverview';
import { ClassStudentView } from '../../class-student';
import { ClassSettings } from './ClassSettings';
import { FeedTab } from '../../class-feed/components';
import { LessonTab } from '../../class-lesson';
import type { Class } from '../../shared/types';
import type { ClassTabs } from '../../shared';

interface ClassDetailTabsProps {
  classId: string;
  currentClass: Class;
  onEditClick: (classData: Class) => void;
}

const tabs = [
  { value: 'overview', icon: Target, labelKey: 'tabs.overview' },
  { value: 'feed', icon: MessageSquare, labelKey: 'tabs.feed' },
  { value: 'students', icon: Users, labelKey: 'tabs.students' },
  { value: 'lessons', icon: BookOpen, labelKey: 'tabs.lessons' },
  { value: 'settings', icon: Settings, labelKey: 'tabs.settings' },
] as const;

export const ClassDetailTabs = ({ classId, currentClass, onEditClick }: ClassDetailTabsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') || 'overview') as ClassTabs;

  const handleTabChange = (tab: ClassTabs) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Vertical Sidebar with Class Info */}
      <aside className="bg-muted/10 w-80 overflow-y-auto border-r">
        {/* Class Information Section */}
        <div className="space-y-4 border-b p-6">
          {/* Title and Status */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{currentClass.name}</h1>
            <Badge variant={currentClass.isActive ? 'default' : 'secondary'}>
              {currentClass.isActive ? t('status.active') : t('status.inactive')}
            </Badge>
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
        {currentTab === 'overview' && (
          <div className="p-6">
            <ClassOverview classData={currentClass} onEditClick={onEditClick} />
          </div>
        )}

        {currentTab === 'feed' && <FeedTab classId={classId} />}

        {currentTab === 'students' && (
          <div className="p-6">
            <ClassStudentView classData={currentClass} />
          </div>
        )}

        {currentTab === 'lessons' && (
          <div className="p-6">
            <LessonTab classId={classId} currentClass={currentClass} />
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
