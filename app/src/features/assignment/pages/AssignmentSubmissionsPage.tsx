import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  Loader2,
  Trophy,
  Users,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { useSubmissionsByPost } from '../hooks';
import { useAssignmentPublic } from '../hooks/useAssignmentApi';
import { formatDistanceToNow } from 'date-fns';
import type { Submission } from '@aiprimary/core';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

export const AssignmentSubmissionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get postId from query params
  const postId = searchParams.get('postId');

  // Fetch assignment and submissions
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentPublic(id);
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useSubmissionsByPost(
    postId || undefined
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = submissions.length;
    const graded = submissions.filter((s) => s.status === 'graded').length;
    const pending = submissions.filter((s) => s.status === 'pending' || s.status === 'submitted').length;

    // Calculate average score for graded submissions
    const gradedSubmissions = submissions.filter(
      (s) => s.status === 'graded' && s.score !== undefined && s.maxScore !== undefined
    );
    const avgScore =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.score! / s.maxScore!) * 100, 0) /
          gradedSubmissions.length
        : 0;

    return {
      total,
      graded,
      pending,
      avgScore: Math.round(avgScore),
    };
  }, [submissions]);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3" />
            Graded
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <FileCheck className="h-3 w-3" />
            Submitted
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoadingAssignment || (postId && isLoadingSubmissions)) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Assignment not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Submissions',
      value: stats.total,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: CheckCircle2,
      label: 'Graded',
      value: stats.graded,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: Clock,
      label: 'Pending Review',
      value: stats.pending,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: stats.graded > 0 ? `${stats.avgScore}%` : 'N/A',
      color: stats.graded > 0 ? getScoreColor(stats.avgScore, 100) : 'text-gray-600 dark:text-gray-400',
      bgColor: stats.graded > 0 ? 'bg-purple-50 dark:bg-purple-950/20' : 'bg-gray-50 dark:bg-gray-950/20',
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          <p className="text-muted-foreground mt-2">{assignment.title}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`rounded-lg border p-4 transition-colors ${stat.bgColor}`}>
              <div className="mb-2 flex items-center justify-between">
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Warning for pending submissions */}
      {stats.pending > 0 && (
        <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>{stats.pending}</strong> {stats.pending === 1 ? 'submission' : 'submissions'} waiting for
            review
          </p>
        </div>
      )}

      {/* Submissions Table */}
      <div className="rounded-lg border bg-white dark:bg-gray-900">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-2 text-lg font-medium">No submissions yet</p>
            <p className="text-muted-foreground text-sm">Students haven't submitted their work yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {submission.student ? (
                      <div>
                        <p className="font-semibold">
                          {submission.student.firstName} {submission.student.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs">{submission.student.email}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Unknown Student</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell>
                    {submission.status === 'graded' &&
                    submission.score !== undefined &&
                    submission.maxScore ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span
                          className={`font-semibold ${getScoreColor(submission.score, submission.maxScore)}`}
                        >
                          {submission.score}/{submission.maxScore}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({Math.round((submission.score / submission.maxScore) * 100)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not graded</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {submission.status === 'graded' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/submissions/${submission.id}/grade`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/submissions/${submission.id}/grade`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/submissions/${submission.id}/grade`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Grade
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!postId && (
        <div className="mt-4 rounded-lg bg-yellow-100 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          Preview mode: Access through a specific homework post to see submissions
        </div>
      )}
    </div>
  );
};
