import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';

interface TeacherRouteProps {
  children: React.ReactNode;
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <GlobalSpinner />;
  }

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ requireAuth: from !== '/', from }} />;
  }

  // Redirect students to student dashboard
  if (user?.role === 'student') {
    return <Navigate to="/student" replace />;
  }

  // Render teacher content
  return <>{children}</>;
}
