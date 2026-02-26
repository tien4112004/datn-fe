import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  type ChartConfig,
  type TooltipContentProps,
} from '@ui/chart';
import { Users, Palette, LayoutTemplate, Database, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const quickStats = [
  {
    title: 'Total Users',
    value: '1,284',
    change: '+12%',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Active Themes',
    value: '48',
    change: '+5%',
    icon: Palette,
    color: 'text-purple-500',
  },
  {
    title: 'Templates',
    value: '136',
    change: '+8%',
    icon: LayoutTemplate,
    color: 'text-green-500',
  },
  {
    title: 'Question Bank',
    value: '72',
    change: '+3%',
    icon: Database,
    color: 'text-amber-500',
  },
];

const userRegistrationData = [
  { month: 'Aug', users: 82 },
  { month: 'Sep', users: 105 },
  { month: 'Oct', users: 134 },
  { month: 'Nov', users: 118 },
  { month: 'Dec', users: 97 },
  { month: 'Jan', users: 156 },
  { month: 'Feb', users: 189 },
];

const activityData = [
  { day: 'Mon', sessions: 320, requests: 540 },
  { day: 'Tue', sessions: 412, requests: 680 },
  { day: 'Wed', sessions: 390, requests: 610 },
  { day: 'Thu', sessions: 478, requests: 752 },
  { day: 'Fri', sessions: 445, requests: 720 },
  { day: 'Sat', sessions: 210, requests: 340 },
  { day: 'Sun', sessions: 185, requests: 298 },
];

const resourceGrowthData = [
  { month: 'Aug', themes: 28, templates: 85, questionBank: 52 },
  { month: 'Sep', themes: 31, templates: 94, questionBank: 56 },
  { month: 'Oct', themes: 35, templates: 103, questionBank: 60 },
  { month: 'Nov', themes: 38, templates: 112, questionBank: 65 },
  { month: 'Dec', themes: 41, templates: 120, questionBank: 68 },
  { month: 'Jan', themes: 45, templates: 128, questionBank: 70 },
  { month: 'Feb', themes: 48, templates: 136, questionBank: 72 },
];

const contentDistributionData = [
  { name: 'Themes', value: 48, color: 'hsl(270, 70%, 60%)' },
  { name: 'Templates', value: 136, color: 'hsl(142, 70%, 45%)' },
  { name: 'Question Bank', value: 72, color: 'hsl(38, 90%, 55%)' },
  { name: 'FAQ Posts', value: 34, color: 'hsl(195, 80%, 50%)' },
];

const userChartConfig = {
  users: { label: 'New Users', color: 'hsl(217, 91%, 60%)' },
} satisfies ChartConfig;

const activityChartConfig = {
  sessions: { label: 'Sessions', color: 'hsl(217, 91%, 60%)' },
  requests: { label: 'AI Requests', color: 'hsl(142, 70%, 45%)' },
} satisfies ChartConfig;

const resourceChartConfig = {
  themes: { label: 'Themes', color: 'hsl(270, 70%, 60%)' },
  templates: { label: 'Templates', color: 'hsl(142, 70%, 45%)' },
  questionBank: { label: 'Question Bank', color: 'hsl(38, 90%, 55%)' },
} satisfies ChartConfig;

export function DashboardPage() {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground flex items-center text-xs">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">{stat.change}</span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Registrations Bar Chart */}
        <Card>
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

        {/* Weekly Activity Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Sessions and AI requests this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityChartConfig} className="h-56 w-full">
              <LineChart data={activityData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="var(--color-sessions)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-requests)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Resource Growth Area Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resource Growth</CardTitle>
            <CardDescription>
              Cumulative themes, templates and question bank items over 7 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={resourceChartConfig} className="h-56 w-full">
              <AreaChart data={resourceGrowthData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThemes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-themes)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-themes)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTemplates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-templates)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-templates)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQuestionBank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-questionBank)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-questionBank)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="themes"
                  stroke="var(--color-themes)"
                  strokeWidth={2}
                  fill="url(#colorThemes)"
                />
                <Area
                  type="monotone"
                  dataKey="templates"
                  stroke="var(--color-templates)"
                  strokeWidth={2}
                  fill="url(#colorTemplates)"
                />
                <Area
                  type="monotone"
                  dataKey="questionBank"
                  stroke="var(--color-questionBank)"
                  strokeWidth={2}
                  fill="url(#colorQuestionBank)"
                />
              </AreaChart>
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
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
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
    </div>
  );
}
