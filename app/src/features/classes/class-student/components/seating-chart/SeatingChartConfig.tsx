import { Button } from '@ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/dialog';
import { Label } from '@ui/label';
import { NumberInput } from '@ui/number-input';
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
  const [open, setOpen] = useState(false);
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

  const handleApply = () => {
    onLayoutChange({ ...layout, columns: cols, rows: rows, separatorInterval });
    setOpen(false);
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            {t('students.layoutConfiguration')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              {t('students.layoutConfiguration')}
            </DialogTitle>
            <DialogDescription>Configure the seating chart layout and spacing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="columns" className="flex items-center gap-1.5">
                <Grid3x3 className="h-4 w-4" />
                {t('students.columns')}
              </Label>
              <NumberInput
                id="columns"
                min={1}
                max={20}
                value={cols}
                onValueChange={(val) => val != null && setCols(val)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rows" className="flex items-center gap-1.5">
                <Grid3x3 className="h-4 w-4" />
                {t('students.rows')}
              </Label>
              <NumberInput
                id="rows"
                min={1}
                max={20}
                value={rows}
                onValueChange={(val) => val != null && setRows(val)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="separator" className="flex items-center gap-1.5">
                <Grid3x3 className="h-4 w-4" />
                {t('students.separatorEvery')}
              </Label>
              <NumberInput
                id="separator"
                min={1}
                max={10}
                value={separatorInterval}
                onValueChange={(val) => val != null && setSeparatorInterval(val)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>{t('students.applyLayout')}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? t('students.exporting') : t('students.export')}
      </Button>
    </div>
  );
};
