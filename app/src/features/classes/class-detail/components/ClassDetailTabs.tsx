import { useSearchParams, useOutlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Settings,
  MessageSquare,
  GraduationCap,
  Calendar,
  Edit,
  FolderOpen,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { getGradeLabel } from '../../shared/utils/grades';

import { ClassStudentView } from '../../class-student';
import { ClassSettings } from './ClassSettings';
import { FeedTab, ClassResourcesTab } from '../../class-feed/components';
import type { Class } from '../../shared/types';
import type { ClassTabs } from '../../shared';

interface ClassDetailTabsProps {
  classId: string;
  currentClass: Class;
  onEditClick: (classData: Class) => void;
}

const tabs = [
  { value: 'feed', icon: MessageSquare, labelKey: 'tabs.feed' },
  { value: 'exercise', icon: BookOpen, labelKey: 'tabs.exercise' },
  { value: 'students', icon: Users, labelKey: 'tabs.students' },
  { value: 'resources', icon: FolderOpen, labelKey: 'tabs.resources' },
  { value: 'settings', icon: Settings, labelKey: 'tabs.settings' },
] as const;

export const ClassDetailTabs = ({ classId, currentClass, onEditClick }: ClassDetailTabsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const { t: tNav } = useTranslation('classes');

  const [searchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') || 'feed') as ClassTabs;
  const outlet = useOutlet();
  const navigate = useNavigate();

  const handleTabChange = (tab: ClassTabs) => {
    navigate(`/classes/${classId}?tab=${tab}`);
  };

  const handleGoToClassList = () => navigate('/classes');

  return (
    <div className="flex h-full flex-col overflow-hidden lg:h-[calc(100vh-4rem)] lg:flex-row">
      {/* Mobile/Tablet Header - Hidden on Desktop */}
      <div className="bg-background shrink-0 border-b lg:hidden">
        {/* Compact Class Info */}
        <div className="border-b px-4 py-3">
          <Button onClick={handleGoToClassList} variant="ghost" size="sm" className="-ml-2 mb-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {tNav('navigation.goToClasses')}
          </Button>
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

        {/* Horizontal Scrollable Tabs — hidden when a sub-page outlet is active */}
        {!outlet && (
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
        )}
      </div>

      {/* Vertical Sidebar with Class Info */}
      <aside className="bg-muted/10 hidden shrink-0 overflow-y-auto border-r lg:block lg:w-72 xl:w-80">
        {/* Back to Class List */}
        <div className="border-b px-4 py-3">
          <Button
            onClick={handleGoToClassList}
            variant="ghost"
            size="sm"
            className="-ml-2 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {tNav('navigation.goToClasses')}
          </Button>
        </div>

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
              <Edit className="h-4 w-4" />
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
      <main className="min-h-0 flex-1 overflow-y-auto">
        {outlet ?? (
          <>
            {currentTab === 'feed' && <FeedTab classId={classId} />}

            {currentTab === 'exercise' && (
              <FeedTab
                classId={classId}
                initialFilter="Exercise"
                onNavigateToFeed={() => handleTabChange('feed')}
              />
            )}

            {currentTab === 'students' && (
              <div className="p-3 sm:p-6">
                <ClassStudentView classData={currentClass} />
              </div>
            )}

            {currentTab === 'resources' && (
              <div className="p-3 sm:p-6">
                <ClassResourcesTab classId={classId} />
              </div>
            )}

            {currentTab === 'settings' && (
              <div className="p-3 sm:p-6">
                <ClassSettings classData={currentClass} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
