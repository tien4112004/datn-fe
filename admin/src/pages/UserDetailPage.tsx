import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiService } from '@/api/admin';
import { useTokenUsageStats, useTokenUsageByModel, useTokenUsageByRequestType } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Coins, DollarSign, Activity, Database } from 'lucide-react';
import { format } from 'date-fns';

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
            <div className="text-2xl font-bold">
              {tokenStats?.totalRequests?.toLocaleString() || '0'}
            </div>
            <p className="text-muted-foreground text-xs">API requests made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tokenStats?.totalTokens?.toLocaleString() || '0'}
            </div>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">First Name</p>
              <p className="text-lg">{user.firstName || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Last Name</p>
              <p className="text-lg">{user.lastName || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Phone</p>
              <p className="text-lg">{user.phoneNumber || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Date of Birth</p>
              <p className="text-lg">
                {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Role</p>
              <p className="text-lg">{user.role || '-'}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Created At</p>
              <p className="text-lg">
                {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy HH:mm') : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Updated At</p>
              <p className="text-lg">
                {user.updatedAt ? format(new Date(user.updatedAt), 'MMMM d, yyyy HH:mm') : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Token Usage by Model</CardTitle>
            <CardDescription>Token consumption breakdown by AI model</CardDescription>
          </CardHeader>
          <CardContent>
            {tokenByModel.length > 0 ? (
              <div className="space-y-4">
                {tokenByModel.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium">{item.model || 'Unknown Model'}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.totalRequests?.toLocaleString() || 0} requests
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {item.totalTokens?.toLocaleString() || 0} tokens
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {item.totalCoin ? `${parseInt(item.totalCoin).toLocaleString()} coins` : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No model usage data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage by Request Type</CardTitle>
            <CardDescription>Token consumption breakdown by request type</CardDescription>
          </CardHeader>
          <CardContent>
            {tokenByType.length > 0 ? (
              <div className="space-y-4">
                {tokenByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium capitalize">{item.requestType || 'Unknown Type'}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.totalRequests?.toLocaleString() || 0} requests
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {item.totalTokens?.toLocaleString() || 0} tokens
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {item.totalCoin ? `${parseInt(item.totalCoin).toLocaleString()} coins` : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No request type data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
