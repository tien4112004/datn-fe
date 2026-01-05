import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
  const [showLayoutConfig, setShowLayoutConfig] = useState(false);

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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('students.title', { count: students.length })}</CardTitle>
          <div className="flex gap-2">
            {viewMode === 'seating-chart' && (
              <>
                <Button
                  variant={showLayoutConfig ? 'default' : 'outline'}
                  onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                >
                  {t('students.layoutConfiguration')}
                </Button>
              </>
            )}
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
              {t('students.listView')}
            </Button>
            <Button
              variant={viewMode === 'seating-chart' ? 'default' : 'outline'}
              onClick={() => setViewMode('seating-chart')}
            >
              {t('students.seatingChartView')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                <SeatingChartView
                  layout={effectiveLayout}
                  students={students}
                  showLayoutConfig={showLayoutConfig}
                  classId={classData.id}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
