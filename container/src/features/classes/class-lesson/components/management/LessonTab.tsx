import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

import { LessonStatusTracker } from './LessonStatusTracker';
import { ScheduleLessonLinker } from '../integration/ScheduleLessonLinker';
import { LessonCreator } from '../form/LessonCreator';
import {
  useClassPeriods,
  useLinkLessonToPeriod,
  useUnlinkLessonFromPeriod,
  type SchedulePeriod,
} from '../../../class-schedule';
import type { Class } from '../../../shared/types';
import { useClassLessons, useUpdateLessonStatus, useCreateLesson } from '../../hooks';

interface LessonTabProps {
  classId: string;
  currentClass: Class;
}

export const LessonTab = ({ classId, currentClass }: LessonTabProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lessonTab' });

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Fetch periods and lessons
  const { data: periodsData } = useClassPeriods(classId, { date: today });
  const { data: lessonsData } = useClassLessons(classId, {});

  const allPeriods = periodsData?.data || [];
  const allLessons = lessonsData?.data || [];

  // Mutation hooks
  const updateLessonStatus = useUpdateLessonStatus();
  const linkLessonToPeriod = useLinkLessonToPeriod();
  const unlinkLessonFromPeriod = useUnlinkLessonFromPeriod();
  const createLesson = useCreateLesson();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createLesson')}
        </Button>
      </div>
      <div className="space-y-6">
        <LessonStatusTracker
          lessons={allLessons}
          onUpdateStatus={async (id, status, notes) => {
            await updateLessonStatus.mutateAsync({ id, status, notes });
          }}
        />

        <ScheduleLessonLinker
          classId={currentClass.id}
          periods={allPeriods}
          lessons={allLessons}
          onLinkLesson={async (periodId, lessonId) => {
            await linkLessonToPeriod.mutateAsync({ classId: currentClass.id, periodId, lessonId });
          }}
          onUnlinkLesson={async (periodId, lessonId) => {
            await unlinkLessonFromPeriod.mutateAsync({ classId: currentClass.id, periodId, lessonId });
          }}
          onCreateLessonForPeriod={(period: SchedulePeriod) => {
            // TODO: Open lesson creation modal with period pre-filled
            console.log('Create lesson for period:', period);
          }}
        />
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-h-[90vh] !max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('createLessonModal.title')}</DialogTitle>
          </DialogHeader>
          <LessonCreator
            classId={currentClass.id}
            onSave={async (lesson) => {
              await createLesson.mutateAsync(lesson);
              setIsCreateModalOpen(false);
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
