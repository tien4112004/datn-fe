import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  type ChartConfig,
  type TooltipContentProps,
} from '@ui/chart';
import { Users, Palette, LayoutTemplate, Database, Activity, Zap, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStats, useAdminStats } from '@/hooks/useApi';

const userChartConfig = {
  users: { label: 'New Users', color: 'hsl(217, 91%, 60%)' },
} satisfies ChartConfig;

const tokenChartConfig = {
  tokens: { label: 'Tokens', color: 'hsl(38, 90%, 55%)' },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: { label: 'Revenue (VND)', color: 'hsl(142, 70%, 45%)' },
} satisfies ChartConfig;

export function DashboardPage() {
  const { totalUsers, totalThemes, totalTemplates, totalQuestions, isLoading } = useDashboardStats();
  const { data: statsData, isLoading: statsLoading } = useAdminStats();
  const stats = statsData?.data;

  const formatRevenue = (v: number | null | undefined) =>
    v != null
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(v)
      : null;

  const quickStats = [
    {
      title: 'Total Users',
      value: totalUsers,
      subtitle: 'Registered accounts',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Active Themes',
      value: totalThemes,
      subtitle: 'Slide themes available',
      icon: Palette,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Templates',
      value: totalTemplates,
      subtitle: 'Slide templates available',
      icon: LayoutTemplate,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Question Bank',
      value: totalQuestions,
      subtitle: 'Public questions',
      icon: Database,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Total AI Tokens',
      value: stats?.totalTokens?.toLocaleString() ?? null,
      subtitle: `${stats?.totalRequests?.toLocaleString() ?? 0} requests`,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      title: 'Total Revenue',
      value: formatRevenue(stats?.totalRevenue),
      subtitle: `${stats?.totalTransactions?.toLocaleString() ?? 0} transactions`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ];

  const allCardsLoading = isLoading || statsLoading;

  // Format month label: "2025-03" → "Mar"
  const shortMonth = (m: string) => new Date(m + '-01').toLocaleString('en', { month: 'short' });

  const userRegistrationData = (stats?.userRegistrationsByMonth ?? []).map((d) => ({
    month: shortMonth(d.month),
    users: d.count,
  }));

  const tokenUsageData = (stats?.tokenUsageByMonth ?? []).map((d) => ({
    month: shortMonth(d.month),
    tokens: d.tokens,
  }));

  const revenueData = (stats?.revenueByMonth ?? []).map((d) => ({
    month: shortMonth(d.month),
    revenue: d.revenue,
  }));

  const contentDistributionData = [
    { name: 'Themes', value: totalThemes ?? 0, color: 'hsl(270, 70%, 60%)' },
    { name: 'Templates', value: totalTemplates ?? 0, color: 'hsl(142, 70%, 45%)' },
    { name: 'Question Bank', value: totalQuestions ?? 0, color: 'hsl(38, 90%, 55%)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the AI Primary Admin Panel</p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-primary h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'API Status', status: 'Operational' },
              { label: 'Database', status: 'Connected' },
              { label: 'AI Model', status: 'Ready' },
              { label: 'Storage', status: 'Available' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm">{label}</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-500">{status}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={cn('shrink-0 rounded-md p-2', stat.bgColor)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground truncate text-xs">{stat.title}</p>
                {allCardsLoading ? (
                  <div className="mt-1 space-y-1">
                    <div className="bg-muted h-6 w-12 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-20 animate-pulse rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold leading-tight">{stat.value ?? '—'}</p>
                    <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: User Registrations + Content Distribution */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>New user sign-ups over the last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={userChartConfig} className="h-56 w-full">
              <BarChart data={userRegistrationData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Content Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Breakdown of all content types</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{}} className="h-44 w-full">
              <PieChart>
                <Pie
                  data={contentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {contentDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }: TooltipContentProps<number, string>) => {
                    if (active && payload?.length) {
                      const d = payload[0];
                      return (
                        <div className="bg-background border-border rounded-md border px-3 py-2 text-sm shadow-md">
                          <p className="font-medium">{d.name}</p>
                          <p className="text-muted-foreground">{d.value} items</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-col gap-1">
              {contentDistributionData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Token Usage + Revenue */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
            <CardDescription>AI tokens consumed over the last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tokenChartConfig} className="h-56 w-full">
              <LineChart data={tokenUsageData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-tokens)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Completed payments over the last 7 months (VND)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-56 w-full">
              <BarChart data={revenueData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                />
                <ChartTooltip
                  content={({ active, payload }: TooltipContentProps<number, string>) => {
                    if (active && payload?.length) {
                      const d = payload[0];
                      return (
                        <div className="bg-background border-border rounded-md border px-3 py-2 text-sm shadow-md">
                          <p className="font-medium">{d.payload.month}</p>
                          <p className="text-muted-foreground">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                              maximumFractionDigits: 0,
                            }).format(Number(d.value))}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
