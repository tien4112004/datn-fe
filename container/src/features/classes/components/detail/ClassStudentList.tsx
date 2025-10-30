import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

import { useSeatingChart } from '../../hooks';
import { StudentListView } from './list-view/StudentListView';
import { SeatingChartView } from './seating-chart/SeatingChartView';

interface ClassStudentListProps {
  classData: any;
}

const ClassStudentList = ({ classData }: ClassStudentListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const [viewMode, setViewMode] = useState('list');
  const [showLayoutConfig, setShowLayoutConfig] = useState(false);
  const { data: initialLayout, isLoading, isError } = useSeatingChart(classData.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('students.title', { count: classData.students.length })}</CardTitle>
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
            <StudentListView students={classData.students} classId={classData.id} isLoading={isLoading} />
          )}
          {viewMode === 'seating-chart' && (
            <>
              {isLoading && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">{t('students.loadingSeatingChart')}</p>
                </div>
              )}
              {isError && (
                <div className="py-8 text-center">
                  <p className="text-destructive">{t('students.errorSeatingChart')}</p>
                </div>
              )}
              {initialLayout && (
                <SeatingChartView
                  layout={initialLayout}
                  students={classData.students}
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

export default ClassStudentList;
