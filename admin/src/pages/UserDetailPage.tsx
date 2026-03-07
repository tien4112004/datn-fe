import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiService } from '@/api/admin';
import { useTokenUsageStats, useTokenUsageByModel, useTokenUsageByRequestType } from '@/hooks';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Separator } from '@ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  type ChartConfig,
  type TooltipContentProps,
} from '@ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { ArrowLeft, Coins, DollarSign, Activity, Database } from 'lucide-react';
import { format } from 'date-fns';

type ChartMetric = 'tokens' | 'requests' | 'coins';

const METRIC_LABELS: Record<ChartMetric, string> = {
  tokens: 'Tokens',
  requests: 'Requests',
  coins: 'Coins',
};

const MODEL_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 70%, 45%)',
  'hsl(270, 70%, 60%)',
  'hsl(38, 90%, 55%)',
  'hsl(0, 80%, 60%)',
];

const TYPE_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 70%, 45%)',
  'hsl(270, 70%, 60%)',
  'hsl(38, 90%, 55%)',
  'hsl(0, 80%, 60%)',
  'hsl(195, 80%, 50%)',
];

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getAdminApiService().getUserById(id!),
    enabled: !!id,
  });

  const user = data?.data;

  // Fetch token usage data
  const { data: tokenUsageData } = useTokenUsageStats(id || '', {});
  const { data: tokenUsageByModelData } = useTokenUsageByModel(id || '');
  const { data: tokenUsageByTypeData } = useTokenUsageByRequestType(id || '');

  const tokenStats = tokenUsageData?.data;
  const tokenByModel = tokenUsageByModelData?.data || [];
  const tokenByType = tokenUsageByTypeData?.data || [];
  const [chartMetric, setChartMetric] = useState<ChartMetric>('tokens');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Failed to load user details</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">View user information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {tokenStats?.totalCoin ? parseInt(tokenStats.totalCoin).toLocaleString() : '0'}
            </div>
            <p className="text-muted-foreground text-xs">Coins used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${tokenStats?.totalMoney ? parseFloat(tokenStats.totalMoney).toFixed(2) : '0.00'}
            </div>
            <p className="text-muted-foreground text-xs">USD equivalent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats?.totalRequests?.toLocaleString() || '0'}</div>
            <p className="text-muted-foreground text-xs">API requests made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats?.totalTokens?.toLocaleString() || '0'}</div>
            <p className="text-muted-foreground text-xs">Tokens processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs font-medium">First Name</p>
              <p className="text-sm">{user.firstName || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Last Name</p>
              <p className="text-sm">{user.lastName || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Phone</p>
              <p className="text-sm">{user.phoneNumber || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Date of Birth</p>
              <p className="text-sm">
                {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Role</p>
              <p className="text-sm">{user.role || '-'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs font-medium">Created At</p>
              <p className="text-sm">
                {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy HH:mm') : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Updated At</p>
              <p className="text-sm">
                {user.updatedAt ? format(new Date(user.updatedAt), 'MMMM d, yyyy HH:mm') : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared metric selector */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Visualize by</p>
        <Select value={chartMetric} onValueChange={(v) => setChartMetric(v as ChartMetric)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tokens">Tokens</SelectItem>
            <SelectItem value="requests">Requests</SelectItem>
            <SelectItem value="coins">Coins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Token Usage by Model — Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Model</CardTitle>
            <CardDescription>{METRIC_LABELS[chartMetric]} breakdown per AI model</CardDescription>
          </CardHeader>
          <CardContent>
            {tokenByModel.length > 0 ? (
              (() => {
                const modelChartData = tokenByModel.map((item) => ({
                  model: item.model || 'Unknown',
                  tokens: item.totalTokens || 0,
                  requests: item.totalRequests || 0,
                  coins: item.totalCoin ? parseInt(item.totalCoin) : 0,
                }));
                const modelChartConfig = Object.fromEntries(
                  modelChartData.map((item, i) => [
                    item.model,
                    { label: item.model, color: MODEL_COLORS[i % MODEL_COLORS.length] },
                  ])
                ) satisfies ChartConfig;
                return (
                  <ChartContainer config={modelChartConfig} className="h-56 w-full">
                    <BarChart
                      layout="vertical"
                      data={modelChartData}
                      margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="model"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        width={90}
                      />
                      <ChartTooltip
                        content={({ active, payload }: TooltipContentProps<number, string>) => {
                          if (active && payload?.length) {
                            const d = payload[0].payload as (typeof modelChartData)[0];
                            return (
                              <div className="bg-background border-border rounded-md border px-3 py-2 text-sm shadow-md">
                                <p className="mb-1 font-semibold">{d.model}</p>
                                <p className="text-muted-foreground">{d.tokens.toLocaleString()} tokens</p>
                                <p className="text-muted-foreground">
                                  {d.requests.toLocaleString()} requests
                                </p>
                                <p className="text-muted-foreground">{d.coins.toLocaleString()} coins</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey={chartMetric} radius={[0, 4, 4, 0]}>
                        {modelChartData.map((_, i) => (
                          <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                );
              })()
            ) : (
              <p className="text-muted-foreground py-8 text-center">No model usage data available</p>
            )}
          </CardContent>
        </Card>

        {/* Usage by Request Type — Donut Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Request Type</CardTitle>
            <CardDescription>{METRIC_LABELS[chartMetric]} share per request type</CardDescription>
          </CardHeader>
          <CardContent>
            {tokenByType.length > 0 ? (
              (() => {
                const typeChartData = tokenByType.map((item) => ({
                  name: item.requestType || 'Unknown',
                  tokens: item.totalTokens || 0,
                  requests: item.totalRequests || 0,
                  coins: item.totalCoin ? parseInt(item.totalCoin) : 0,
                }));
                return (
                  <div className="flex flex-col items-center gap-4">
                    <ChartContainer config={{}} className="h-44 w-full">
                      <PieChart>
                        <Pie
                          data={typeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={3}
                          dataKey={chartMetric}
                        >
                          {typeChartData.map((_, i) => (
                            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }: TooltipContentProps<number, string>) => {
                            if (active && payload?.length) {
                              const d = payload[0].payload as (typeof typeChartData)[0];
                              return (
                                <div className="bg-background border-border rounded-md border px-3 py-2 text-sm shadow-md">
                                  <p className="mb-1 font-semibold capitalize">{d.name}</p>
                                  <p className="text-muted-foreground">{d.tokens.toLocaleString()} tokens</p>
                                  <p className="text-muted-foreground">
                                    {d.requests.toLocaleString()} requests
                                  </p>
                                  <p className="text-muted-foreground">{d.coins.toLocaleString()} coins</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ChartContainer>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      {typeChartData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground capitalize">
                            {entry.name} ({entry[chartMetric].toLocaleString()})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-muted-foreground py-8 text-center">No request type data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
