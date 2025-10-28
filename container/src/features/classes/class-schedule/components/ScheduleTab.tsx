import { useState } from 'react';
import { ViewModeToggle, type ViewMode } from './common/ViewModeToggle';
import SubjectContextView from './subject-view/SubjectContextView';
import ScheduleView from './schedule-view/ScheduleView';
import { PeriodDetailsDialog } from './detail/PeriodDetailsDialog';
import { AddPeriodDialog } from './add-period/AddPeriodDialog';

interface ScheduleViewProps {
  classId: string;
}

export const ScheduleTab = ({ classId }: ScheduleViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isAddPeriodOpen, setAddPeriodOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleAddPeriod = (date: string) => {
    setSelectedDate(date);
    setAddPeriodOpen(true);
  };

  return (
    <div className="space-y-6">
      <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
      {viewMode === 'subject' ? (
        <SubjectContextView classId={classId} />
      ) : (
        <ScheduleView classId={classId} onAddPeriod={handleAddPeriod} />
      )}
      <PeriodDetailsDialog />
      <AddPeriodDialog
        open={isAddPeriodOpen}
        onOpenChange={setAddPeriodOpen}
        classId={classId}
        selectedDate={selectedDate}
      />
    </div>
  );
};
