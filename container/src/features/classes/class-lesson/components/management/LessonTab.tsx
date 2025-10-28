import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

import { LessonStatusTracker } from './LessonStatusTracker';
import { ScheduleLessonLinker } from '../integration/ScheduleLessonLinker';
import { LessonPlanCreator } from '../form/LessonPlanCreator';
import {
  useClassPeriods,
  useLinkLessonToPeriod,
  useUnlinkLessonFromPeriod,
  type SchedulePeriod,
} from '../../../class-schedule';
import type { Class } from '../../../shared/types';
import { useClassLessonPlans, useUpdateLessonStatus, useCreateLessonPlan } from '../../hooks';

interface LessonTabProps {
  classId: string;
  currentClass: Class;
}

export const LessonTab = ({ classId, currentClass }: LessonTabProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lessonTab' });

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Fetch periods and lesson plans
  const { data: periodsData } = useClassPeriods(classId, { date: today });
  const { data: lessonPlansData } = useClassLessonPlans(classId, {});

  const allPeriods = periodsData?.data || [];
  const allLessonPlans = lessonPlansData?.data || [];

  // Mutation hooks
  const updateLessonStatus = useUpdateLessonStatus();
  const linkLessonToPeriod = useLinkLessonToPeriod();
  const unlinkLessonFromPeriod = useUnlinkLessonFromPeriod();
  const createLessonPlan = useCreateLessonPlan();

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
          lessonPlans={allLessonPlans}
          onUpdateStatus={async (id, status, notes) => {
            await updateLessonStatus.mutateAsync({ id, status, notes });
          }}
        />

        <ScheduleLessonLinker
          classId={currentClass.id}
          periods={allPeriods}
          lessonPlans={allLessonPlans}
          onLinkLesson={async (periodId, lessonPlanId) => {
            await linkLessonToPeriod.mutateAsync({ classId: currentClass.id, periodId, lessonPlanId });
          }}
          onUnlinkLesson={async (periodId) => {
            await unlinkLessonFromPeriod.mutateAsync({ classId: currentClass.id, periodId });
          }}
          onCreateLessonForPeriod={(period: SchedulePeriod) => {
            // TODO: Open lesson plan creation modal with period pre-filled
            console.log('Create lesson for period:', period);
          }}
        />
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-h-[90vh] !max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('createLessonModal.title')}</DialogTitle>
          </DialogHeader>
          <LessonPlanCreator
            classId={currentClass.id}
            onSave={async (lessonPlan) => {
              await createLessonPlan.mutateAsync(lessonPlan);
              setIsCreateModalOpen(false);
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
