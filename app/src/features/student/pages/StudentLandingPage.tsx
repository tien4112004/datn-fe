import { Navigate } from 'react-router-dom';
import { useClasses } from '@/features/classes/shared/hooks/useApi';
import GlobalSpinner from '@/components/common/GlobalSpinner';

export const StudentLandingPage = () => {
  const { data: classes, isLoading } = useClasses({
    page: 0,
    pageSize: 1,
  });

  if (isLoading) {
    return <GlobalSpinner />;
  }

  if (classes && classes.length > 0) {
    return <Navigate to={`/student/classes/${classes[0].id}`} replace />;
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Class Found</h2>
          <p className="text-muted-foreground">You are not assigned to any class yet.</p>
        </div>
      </div>
    );
  }

  return null;
};
