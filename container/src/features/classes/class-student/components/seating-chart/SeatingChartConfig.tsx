import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import type { Layout } from '@/features/classes/shared/types';
import { Grid3x3, Settings2, Download } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExportStudentChart } from '../../hooks';

export const SeatingChartConfig = ({
  onLayoutChange,
  layout,
  chartRef,
}: {
  onLayoutChange: (layout: Layout) => void;
  layout: Layout;
  chartRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const [cols, setCols] = useState(layout.columns);
  const [rows, setRows] = useState(layout.rows);
  const [separatorInterval, setSeparatorInterval] = useState(layout.separatorInterval ?? 2);
  const [isExporting, setIsExporting] = useState(false);
  const { exportChart } = useExportStudentChart({
    filename: `student-chart-${new Date().toISOString().split('T')[0]}.png`,
  });

  const handleExport = () => {
    if (!chartRef?.current) return;
    setIsExporting(true);
    try {
      const tempId = `chart-export-${Date.now()}`;
      chartRef.current.id = tempId;
      exportChart(tempId);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 mb-10 p-4">
      <div className="flex flex-row gap-4">
        <div className="text-primary flex items-center justify-center gap-2">
          <Settings2 className="h-5 w-5" />
          <h3 className="font-semibold">{t('students.layoutConfiguration')}</h3>
        </div>
        <div className="flex flex-1 items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Label htmlFor="columns" className="flex items-center gap-1.5 text-sm font-medium">
              <Grid3x3 className="h-4 w-4" />
              <span className="whitespace-nowrap">{t('students.columns')}</span>
            </Label>
            <NumberInput
              id="columns"
              min={1}
              max={20}
              value={cols}
              onValueChange={(val: number) => setCols(val)}
              className="h-10 w-full"
            />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <Label htmlFor="rows" className="flex items-center gap-1.5 text-sm font-medium">
              <Grid3x3 className="h-4 w-4" />
              <span className="whitespace-nowrap">{t('students.rows')}</span>
            </Label>
            <NumberInput
              id="rows"
              min={1}
              max={20}
              value={rows}
              onValueChange={(val: number) => setRows(val)}
              className="h-10 w-full"
            />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <Label htmlFor="separator" className="flex items-center gap-1.5 text-sm font-medium">
              <Grid3x3 className="h-4 w-4" />
              <span className="whitespace-nowrap">{t('students.separatorEvery')}</span>
            </Label>
            <NumberInput
              id="separator"
              min={1}
              max={10}
              value={separatorInterval}
              onValueChange={(val: number) => setSeparatorInterval(val)}
              className="h-10 w-full"
            />
          </div>
          <Button
            onClick={() => {
              onLayoutChange({ ...layout, columns: cols, rows: rows, separatorInterval });
            }}
            className="h-10 min-w-[120px]"
            variant="default"
          >
            {t('students.applyLayout')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="h-10 min-w-[120px]"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? t('students.exporting') : t('students.export')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
