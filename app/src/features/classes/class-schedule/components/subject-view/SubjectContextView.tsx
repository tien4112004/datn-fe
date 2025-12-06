import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSubjects, useSubjectPeriods } from '../../hooks';
import { useScheduleHelpers } from '../../hooks/useScheduleHelpers';
import SubjectSelector from './SubjectSelector';
import SubjectPeriodList from './SubjectPeriodList';
import ScheduleStatsDisplay from '../schedule-view/ScheduleStats';
import { useScheduleStore } from '../../stores/scheduleStore';

interface SubjectContextViewProps {
  classId: string;
}

const SubjectContextView = ({ classId }: SubjectContextViewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule' });
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(null);
  const { getSubjectStats } = useScheduleHelpers();
  const { openPeriodDetails } = useScheduleStore();

  // Fetch subjects
  const { data: subjects = [], isLoading: isLoadingSubjects, error: subjectsError } = useSubjects(classId);

  // Fetch periods for selected subject
  const {
    data: periods = [],
    isLoading: isLoadingPeriods,
    error: periodsError,
  } = useSubjectPeriods(classId, selectedSubjectCode);

  const stats = getSubjectStats(periods);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('subjectView.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t('subjectView.selectSubjectLabel')}</label>
            {isLoadingSubjects ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : subjectsError ? (
              <p className="text-sm text-red-500">{t('subjectView.error')}</p>
            ) : (
              <SubjectSelector
                subjectCodes={subjects}
                selectedSubjectCode={selectedSubjectCode}
                onSubjectChange={setSelectedSubjectCode}
                isLoading={isLoadingSubjects}
              />
            )}
          </div>

          {/* Periods List with Stats */}
          {selectedSubjectCode && (
            <div>
              {isLoadingPeriods ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="flex justify-between">
                  <div className="flex-1">
                    <SubjectPeriodList
                      periods={periods}
                      isLoading={isLoadingPeriods}
                      error={periodsError}
                      onPeriodClick={(periodId) => openPeriodDetails(periodId)}
                    />
                  </div>
                  <ScheduleStatsDisplay stats={stats} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SubjectContextView;
