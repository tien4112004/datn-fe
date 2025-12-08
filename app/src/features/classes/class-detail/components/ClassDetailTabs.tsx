import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Calendar, BookOpen, Target, Users, Settings } from 'lucide-react';

import { ClassOverview } from './ClassOverview';
import { ClassStudentView } from '../../class-student';
import { ClassSettings } from './ClassSettings';
import { FeedPage } from '@/features/classes/class-feed/components';
import { LessonTab } from '../../class-lesson';
import type { Class } from '../../shared/types';
import { ScheduleTab } from '../../class-schedule';
import type { ClassTabs } from '../../shared';

interface ClassDetailTabsProps {
  classId: string;
  currentClass: Class;
  onEditClick: (classData: Class) => void;
}

export const ClassDetailTabs = ({ classId, currentClass, onEditClick }: ClassDetailTabsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'feed';

  const handleTabChange = (tab: ClassTabs) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="space-y-6 px-8">
      {/* Detailed Tabs */}
      <Tabs
        defaultValue="feed"
        className="mx-12 space-y-4"
        value={currentTab}
        onValueChange={(value) => handleTabChange(value as ClassTabs)}
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="feed" className="flex cursor-pointer items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {t('tabs.feed')}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex cursor-pointer items-center gap-1">
            <Calendar className="h-4 w-4" />
            {t('tabs.schedule')}
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex cursor-pointer items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {t('tabs.lessons')}
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex cursor-pointer items-center gap-1">
            <Target className="h-4 w-4" />
            {t('tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="students" className="flex cursor-pointer items-center gap-1">
            <Users className="h-4 w-4" />
            {t('tabs.students')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex cursor-pointer items-center gap-1">
            <Settings className="h-4 w-4" />
            {t('tabs.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <FeedPage classId={classId} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTab classId={currentClass.id} />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <LessonTab classId={classId} currentClass={currentClass} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <ClassOverview classData={currentClass} onEditClick={onEditClick} />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <ClassStudentView classData={currentClass} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ClassSettings classData={currentClass} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
