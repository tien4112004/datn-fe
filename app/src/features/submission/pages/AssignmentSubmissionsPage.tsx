import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { CheckCircle2, Clock, Eye, FileCheck, Loader2, Trophy, Users, TrendingUp, Edit } from 'lucide-react';
import { useSubmissionsByPost } from '../hooks';
import { useAssignment, useAssignmentByPost } from '@/features/assignment/hooks/useAssignmentApi';
import { useFormattedDistance } from '@/shared/lib/date-utils';
import type { Submission } from '@aiprimary/core';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { PageContainer } from '@/shared/components/common/PageContainer';

interface StudentGroup {
  studentId: string;
  studentName: string;
  studentEmail: string;
  submissions: Submission[];
  representative: Submission;
}

function groupByStudent(submissions: Submission[]): StudentGroup[] {
  const map = new Map<string, Submission[]>();

  for (const s of submissions) {
    const key = s.studentId ?? 'unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }

  const groups: StudentGroup[] = [];
  for (const [studentId, subs] of map.entries()) {
    // Sort: latest first
    const sorted = [...subs].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    // Pick representative: highest score among graded, else latest
    const graded = sorted.filter((s) => s.status === 'graded' && s.score !== undefined && s.maxScore);
    let representative: Submission;
    if (graded.length > 0) {
      representative = graded.reduce((best, s) =>
        s.score! / s.maxScore! > best.score! / best.maxScore! ? s : best
      );
    } else {
      representative = sorted[0];
    }

    const firstSub = sorted[0];
    const student = firstSub.student;
    groups.push({
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      studentEmail: student?.email ?? '',
      submissions: sorted,
      representative,
    });
  }

  // Sort groups alphabetically by student name
  groups.sort((a, b) => a.studentName.localeCompare(b.studentName));
  return groups;
}

export const AssignmentSubmissionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('assignment', { keyPrefix: 'submissions.assignmentSubmissions' });
  const { t: tActions } = useTranslation('assignment', { keyPrefix: 'submissions.actions' });
  const { t: tStatus } = useTranslation('assignment', { keyPrefix: 'submissions.status' });
  const { formatDistanceToNow } = useFormattedDistance();

  // Get postId from query params
  const postId = searchParams.get('postId');

  const { data: assignmentByPost, isLoading: isLoadingByPost } = useAssignmentByPost(postId ?? undefined);
  const { data: assignmentById, isLoading: isLoadingById } = useAssignment(postId ? undefined : id);
  const assignment = assignmentByPost ?? assignmentById;
  const isLoadingAssignment = isLoadingByPost || isLoadingById;
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useSubmissionsByPost(
    postId || undefined
  );

  const studentGroups = useMemo(() => groupByStudent(submissions), [submissions]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudents = studentGroups.length;
    const gradedStudents = studentGroups.filter((g) =>
      g.submissions.some((s) => s.status === 'graded')
    ).length;
    const pendingStudents = studentGroups.filter(
      (g) =>
        g.submissions.every((s) => s.status !== 'graded') &&
        g.submissions.some((s) => s.status === 'submitted' || s.status === 'pending')
    ).length;

    const gradedSubmissions = submissions.filter(
      (s) => s.status === 'graded' && s.score !== undefined && s.maxScore !== undefined
    );
    const avgScore =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.score! / s.maxScore!) * 100, 0) /
          gradedSubmissions.length
        : 0;

    return {
      totalStudents,
      gradedStudents,
      pendingStudents,
      avgScore: Math.round(avgScore),
    };
  }, [studentGroups, submissions]);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3" />
            {tStatus('graded')}
          </span>
        );
      case 'submitted':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <FileCheck className="h-3 w-3" />
            {tStatus('submitted')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            {tStatus('inProgress')}
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

  const renderScoreCell = (submission: Submission) => {
    if (submission.status === 'graded' && submission.score !== undefined && submission.maxScore) {
      return (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span className={`font-semibold ${getScoreColor(submission.score, submission.maxScore)}`}>
            {submission.score}/{submission.maxScore}
          </span>
          <span className="text-muted-foreground text-xs">
            ({Math.round((submission.score / submission.maxScore) * 100)}%)
          </span>
        </div>
      );
    }
    return <span className="text-muted-foreground text-sm">{t('notGraded')}</span>;
  };

  const renderActions = (submission: Submission) => (
    <div className="flex justify-end gap-2">
      {submission.status === 'graded' ? (
        <>
          <Button variant="outline" size="sm" onClick={() => navigate(`/submissions/${submission.id}/grade`)}>
            <Eye className="mr-2 h-4 w-4" />
            {tActions('view')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/submissions/${submission.id}/grade`)}>
            <Edit className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button variant="default" size="sm" onClick={() => navigate(`/submissions/${submission.id}/grade`)}>
          <Edit className="mr-2 h-4 w-4" />
          {tActions('grade')}
        </Button>
      )}
    </div>
  );

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
          <p className="text-lg font-semibold">{t('notFound')}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            {tActions('goBack')}
          </Button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: t('totalStudents'),
      value: stats.totalStudents,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: CheckCircle2,
      label: t('graded'),
      value: stats.gradedStudents,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: Clock,
      label: t('pendingReview'),
      value: stats.pendingStudents,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    },
    {
      icon: TrendingUp,
      label: t('averageScore'),
      value: stats.gradedStudents > 0 ? `${stats.avgScore}%` : t('notAvailable'),
      color:
        stats.gradedStudents > 0 ? getScoreColor(stats.avgScore, 100) : 'text-gray-600 dark:text-gray-400',
      bgColor:
        stats.gradedStudents > 0 ? 'bg-purple-50 dark:bg-purple-950/20' : 'bg-gray-50 dark:bg-gray-950/20',
    },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <PageHeader title={t('title')} description={assignment.title} onBack={() => navigate(-1)} />
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
      {stats.pendingStudents > 0 && (
        <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>{stats.pendingStudents}</strong> {t('waitingForReview')}
          </p>
        </div>
      )}

      {/* Submissions Table grouped by student */}
      <div className="rounded-lg border bg-white dark:bg-gray-900">
        {studentGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-2 text-lg font-medium">{t('noSubmissions')}</p>
            <p className="text-muted-foreground text-sm">{t('studentsHaventSubmitted')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tableHeaders.student')}</TableHead>
                <TableHead>{t('tableHeaders.attempts')}</TableHead>
                <TableHead>{t('tableHeaders.submitted')}</TableHead>
                <TableHead>{t('tableHeaders.status')}</TableHead>
                <TableHead>{t('tableHeaders.score')}</TableHead>
                <TableHead className="text-right">{t('tableHeaders.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentGroups.map((group) => {
                const rep = group.representative;
                return (
                  <TableRow key={group.studentId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {group.studentName ? (
                        <div>
                          <p className="font-semibold">{group.studentName}</p>
                          <p className="text-muted-foreground text-xs">{group.studentEmail}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t('unknownStudent')}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
                        {group.submissions.length}{' '}
                        {group.submissions.length === 1 ? t('attemptSingular') : t('attemptPlural')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(rep.submittedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(rep.status)}</TableCell>
                    <TableCell>{renderScoreCell(rep)}</TableCell>
                    <TableCell className="text-right">{renderActions(rep)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {!postId && (
        <div className="mt-4 rounded-lg bg-yellow-100 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          {t('previewMode')}
        </div>
      )}
    </PageContainer>
  );
};
