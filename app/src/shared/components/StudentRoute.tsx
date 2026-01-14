import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';

interface StudentRouteProps {
  children: React.ReactNode;
}

export function StudentRoute({ children }: StudentRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect non-students to main dashboard
  if (user?.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  // Render student content
  return <>{children}</>;
}
