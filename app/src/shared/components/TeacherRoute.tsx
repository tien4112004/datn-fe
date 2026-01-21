import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';

interface TeacherRouteProps {
  children: React.ReactNode;
}

export function TeacherRoute({ children }: TeacherRouteProps) {
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

  // Redirect students to student dashboard
  if (user?.role === 'student') {
    return <Navigate to="/student" replace />;
  }

  // Render teacher content
  return <>{children}</>;
}
