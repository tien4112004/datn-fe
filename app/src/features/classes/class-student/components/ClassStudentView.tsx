import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, List, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { StudentListView } from './list-view/StudentListView';
import { SeatingChartView } from './seating-chart/SeatingChartView';
import type { Class } from '../../shared/types';
import { useSeatingChart, useClassStudents } from '../hooks';
import { createDefaultLayout } from '../utils';

interface ClassStudentListProps {
  classData: Class;
}

export const ClassStudentView = ({ classData }: ClassStudentListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const [viewMode, setViewMode] = useState('list');

  // Fetch students from /classes/:id/students endpoint
  const { data: students = [], isLoading: isLoadingStudents } = useClassStudents(classData.id);
  const { data: initialLayout, isLoading: isLoadingLayout, isError } = useSeatingChart(classData.id);

  // Auto-initialize layout if none exists
  const effectiveLayout = useMemo(() => {
    // If layout exists, use it
    if (initialLayout) return initialLayout;

    // If still loading, don't create default yet
    if (isLoadingLayout) return null;

    // If error occurred (network/server issue), don't auto-initialize
    if (isError) return null;

    // If no layout exists (initialLayout === null) and not loading/error,
    // create default layout based on student count
    return createDefaultLayout(students.length);
  }, [initialLayout, isLoadingLayout, isError, students.length]);

  return (
    <div className="space-y-4">
      {/* Minimal Header with Segmented Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-muted-foreground h-5 w-5" />
          <h2 className="text-xl font-semibold">{t('tabs.students')}</h2>
          <Badge variant="secondary">{students.length}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {/* Segmented Control */}
          <div className="bg-muted inline-flex rounded-lg border p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('seating-chart')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === 'seating-chart'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Chart
            </button>
          </div>
        </div>
      </div>

      {/* Content - No Card Wrapper */}
      <div>
        {viewMode === 'list' && (
          <StudentListView students={students} classId={classData.id} isLoading={isLoadingStudents} />
        )}
        {viewMode === 'seating-chart' && (
          <>
            {isLoadingLayout && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">{t('students.loadingSeatingChart')}</p>
              </div>
            )}
            {isError && (
              <div className="py-8 text-center">
                <p className="text-destructive">{t('students.errorSeatingChart')}</p>
              </div>
            )}
            {!isLoadingLayout && !isError && effectiveLayout && (
              <SeatingChartView layout={effectiveLayout} students={students} classId={classData.id} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
