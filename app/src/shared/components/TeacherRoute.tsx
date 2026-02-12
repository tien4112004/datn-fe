import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';

interface TeacherRouteProps {
  children: React.ReactNode;
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <GlobalSpinner />;
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
