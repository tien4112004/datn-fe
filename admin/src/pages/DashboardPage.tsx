import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Palette,
  LayoutTemplate,
  Settings,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const dashboardItems = [
  {
    to: '/users',
    icon: Users,
    title: 'Users',
    description: 'Manage user accounts and permissions',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    to: '/slide-themes',
    icon: Palette,
    title: 'Slide Themes',
    description: 'Create and manage slide themes',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    to: '/slide-templates',
    icon: LayoutTemplate,
    title: 'Slide Templates',
    description: 'Configure slide layouts and templates',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    to: '/books',
    icon: BookOpen,
    title: 'Books',
    description: 'Manage textbooks and teacher books',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    to: '/model-config',
    icon: Settings,
    title: 'Model Configuration',
    description: 'Configure AI model settings',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    to: '/faq-posts',
    icon: HelpCircle,
    title: 'FAQ Posts',
    description: 'Manage frequently asked questions',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
];

const quickStats = [
  {
    title: 'Total Users',
    value: '-',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Active Themes',
    value: '-',
    change: '+5%',
    trend: 'up',
    icon: Palette,
    color: 'text-purple-500',
  },
  {
    title: 'Templates',
    value: '-',
    change: '+8%',
    trend: 'up',
    icon: LayoutTemplate,
    color: 'text-green-500',
  },
  {
    title: 'Books',
    value: '-',
    change: '+3%',
    trend: 'up',
    icon: BookOpen,
    color: 'text-amber-500',
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the AI Primary Admin Panel</p>
      </div>

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

      {/* Navigation Cards */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Navigation</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <Card className="hover:bg-accent/50 group h-full cursor-pointer transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className={cn('rounded-lg p-2', item.bgColor)}>
                    <item.icon className={cn('h-6 w-6', item.color)} />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary text-base font-medium transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm">{item.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="text-primary h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system health and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium text-green-500">Operational</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium text-green-500">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Model</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium text-green-500">Ready</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium text-green-500">Available</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground py-8 text-center text-sm">No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
