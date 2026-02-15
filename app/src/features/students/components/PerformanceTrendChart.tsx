import * as RechartsPrimitive from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import type { PerformanceTrend } from '../types';

interface PerformanceTrendChartProps {
  data: PerformanceTrend[];
}

const chartConfig = {
  averageScore: {
    label: 'Average Score',
    color: 'hsl(var(--chart-1))',
  },
};

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  // Type assertions for Recharts components to work around TypeScript issues
  const AreaChart = RechartsPrimitive.AreaChart as any;
  const CartesianGrid = RechartsPrimitive.CartesianGrid as any;
  const XAxis = RechartsPrimitive.XAxis as any;
  const YAxis = RechartsPrimitive.YAxis as any;
  const Area = RechartsPrimitive.Area as any;
  const Tooltip = ChartTooltip as any;

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillAverageScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-averageScore)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-averageScore)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value: string) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[0, 100]}
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="averageScore"
          type="monotone"
          fill="url(#fillAverageScore)"
          fillOpacity={0.4}
          stroke="var(--color-averageScore)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
