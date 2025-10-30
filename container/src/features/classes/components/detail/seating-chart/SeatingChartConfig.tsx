import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Layout } from '@/features/classes/types/entities/layout';
import layout from 'antd/es/layout';
import { Grid3x3, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SeatingChartConfig = ({ onLayoutChange }: { onLayoutChange: (layout: Layout) => void }) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const [cols, setCols] = useState(layout.columns);
  const [rows, setRows] = useState(layout.rows);

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
            <Input
              id="columns"
              type="number"
              min="1"
              max="20"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="h-10 w-full"
            />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <Label htmlFor="rows" className="flex items-center gap-1.5 text-sm font-medium">
              <Grid3x3 className="h-4 w-4" />
              <span className="whitespace-nowrap">{t('students.rows')}</span>
            </Label>
            <Input
              id="rows"
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="h-10 w-full"
            />
          </div>
          <Button
            onClick={() => {
              onLayoutChange({ ...layout, columns: cols, rows: rows });
            }}
            className="h-10 min-w-[120px]"
            variant="default"
          >
            {t('students.applyLayout')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SeatingChartConfig;
