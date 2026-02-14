import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { useStudent, useStudentPerformance } from '../hooks/useApi';
import { StudentInfoSection } from '../components/StudentInfoSection';
import { StudentPerformanceSection } from '../components/StudentPerformanceSection';
import { StudentDetailSkeleton } from '../components/StudentDetailSkeleton';
import { PageHeader } from '../components/PageHeader';

/**
 * Student Detail Page
 *
 * Design Principles:
 * - Soft UI Evolution: Modern, accessible, better contrast
 * - Swiss Modernism: Clean hierarchy, grid-based layout
 * - Educational Dashboard: Professional yet approachable
 *
 * UX Best Practices:
 * - Skeleton screens for loading states (not blank screens)
 * - Clear error messages with actionable solutions
 * - Smooth transitions and micro-interactions
 * - Accessible color contrast (WCAG AA+)
 */
export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  // React Hooks: All hooks at top level (React best practice)
  const {
    data: student,
    isLoading: isLoadingStudent,
    error: studentError,
    refetch: refetchStudent,
  } = useStudent(studentId!);

  const {
    data: performance,
    isLoading: isLoadingPerformance,
    error: performanceError,
    refetch: refetchPerformance,
  } = useStudentPerformance(student?.userId);

  // Handler functions
  const handleBack = () => navigate(-1);
  const handleRetryStudent = () => refetchStudent();
  const handleRetryPerformance = () => refetchPerformance();

  // Loading State: Use skeleton screen (UX best practice)
  if (isLoadingStudent) {
    return (
      <div className="container mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Loading..." onBack={handleBack} />
        <StudentDetailSkeleton />
      </div>
    );
  }

  // Error State: Clear message with retry action
  if (studentError || !student) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Student Not Found" onBack={handleBack} />

        <Alert variant="destructive" className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Unable to Load Student</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              We couldn't find this student's information. This could be because:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>The student ID is incorrect or the student doesn't exist</li>
              <li>You don't have permission to view this student</li>
              <li>There's a temporary connection issue</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryStudent}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                Go Back
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Success State: Display student information and performance
  const fullName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
  const pageDescription = `View ${fullName}'s academic performance, progress, and detailed information`;

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header with Breadcrumb */}
      <PageHeader
        title={fullName}
        description={pageDescription}
        onBack={handleBack}
      />

      {/* Student Information Card */}
      <section aria-label="Student Information">
        <StudentInfoSection student={student} />
      </section>

      {/* Performance Analytics Section */}
      <section aria-label="Performance Analytics">
        {isLoadingPerformance ? (
          // Performance Loading State: Skeleton for performance section only
          <div className="space-y-4 animate-pulse">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        ) : performanceError || !performance ? (
          // Performance Error State: Helpful message with retry
          <Alert className="border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-lg font-semibold">Performance Data Unavailable</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                Unable to load performance analytics. This may be because {fullName} hasn't
                completed any assignments yet, or there's a temporary connection issue.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryPerformance}
                className="gap-2 mt-3"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          // Performance Success State
          <div className="animate-in fade-in-50 duration-300">
            <StudentPerformanceSection performance={performance} />
          </div>
        )}
      </section>
    </div>
  );
}
