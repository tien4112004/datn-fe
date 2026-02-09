import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, FileQuestion, Loader2 } from 'lucide-react';
import { useAssignmentPublic } from '../hooks';

export const AssignmentPublicViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: assignment, isLoading, error } = useAssignmentPublic(id);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Assignment not found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const totalPoints = assignment.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900">
            <h1 className="text-3xl font-bold">{assignment.title}</h1>

            {assignment.description && <p className="text-muted-foreground mt-3">{assignment.description}</p>}

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {assignment.questions && assignment.questions.length > 0 && (
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4" />
                  <span>{assignment.questions.length} questions</span>
                </div>
              )}
              {totalPoints > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Total: {totalPoints} points</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        {assignment.questions && assignment.questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            {assignment.questions.map((item, index) => (
              <div
                key={item.question.id || index}
                className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900"
              >
                <div className="mb-4">
                  <h3 className="font-semibold">
                    Question {index + 1} {item.points && `(${item.points} points)`}
                  </h3>
                </div>
                <div>
                  <p className="text-base">{item.question.title}</p>
                  {item.question.titleImageUrl && (
                    <img
                      src={item.question.titleImageUrl}
                      alt="Question"
                      className="mt-4 max-w-full rounded-lg border"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(!assignment.questions || assignment.questions.length === 0) && (
          <div className="text-muted-foreground rounded-lg border bg-white p-8 text-center dark:bg-gray-900">
            No questions in this assignment
          </div>
        )}
      </div>
    </div>
  );
};
