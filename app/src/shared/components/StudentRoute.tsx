import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';

interface StudentRouteProps {
  children: React.ReactNode;
}

export function StudentRoute({ children }: StudentRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <GlobalSpinner />;
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
