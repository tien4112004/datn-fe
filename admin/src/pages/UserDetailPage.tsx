import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => adminApi.getUserById(id!),
    enabled: !!id,
  });

  const user = data?.data;

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

      <Card>
        <CardHeader>
          <CardTitle>
            {user.firstName} {user.lastName}
          </CardTitle>
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
    </div>
  );
}
