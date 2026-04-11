import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/auth';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';

interface StudentRouteProps {
  children: React.ReactNode;
}

export function StudentRoute({ children }: StudentRouteProps) {
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

  // Redirect non-students to main dashboard
  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  // Render student content
  return <>{children}</>;
}
