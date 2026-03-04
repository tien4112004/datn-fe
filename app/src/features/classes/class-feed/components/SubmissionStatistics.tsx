import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileQuestion, Clock, Eye, Edit, Trophy, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Button } from '@ui/button';
import { Skeleton } from '@ui/skeleton';
import { useSubmissionsByPost } from '@/features/assignment/hooks';
import { SubmissionStatusBadge } from '@/features/assignment/components/SubmissionStatusBadge';
import { useFormattedDistance } from '@/shared/lib/date-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import type { Submission } from '@aiprimary/core';

interface SubmissionStatisticsProps {
  postId: string;
  assignmentId?: string;
}

interface StudentGroup {
  studentId: string;
  studentName: string;
  studentEmail: string;
  submissions: Submission[]; // sorted latest-first
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
    const sorted = [...subs].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    const graded = sorted.filter((s) => s.status === 'graded' && s.score !== undefined && s.maxScore);
    const representative =
      graded.length > 0
        ? graded.reduce((best, s) => (s.score! / s.maxScore! > best.score! / best.maxScore! ? s : best))
        : sorted[0];

    const student = sorted[0].student;
    groups.push({
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      studentEmail: student?.email ?? '',
      submissions: sorted,
      representative,
    });
  }

  groups.sort((a, b) => a.studentName.localeCompare(b.studentName));
  return groups;
}

export const SubmissionStatistics = ({ postId }: SubmissionStatisticsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('classes', { keyPrefix: 'submissionStatistics' });
  const { formatDistanceToNow } = useFormattedDistance();
  const { data: submissions = [], isLoading } = useSubmissionsByPost(postId);
  const [showTable, setShowTable] = useState(true);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const studentGroups = useMemo(() => groupByStudent(submissions), [submissions]);

  const toggleExpand = (studentId: string) => {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const renderScore = (sub: Submission) => {
    if (sub.status === 'graded' && sub.score !== undefined && sub.maxScore) {
      return (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span className={`font-semibold ${getScoreColor((sub.score / sub.maxScore) * 100)}`}>
            {sub.score}/{sub.maxScore}
          </span>
          <span className="text-muted-foreground text-xs">
            ({Math.round((sub.score / sub.maxScore) * 100)}%)
          </span>
        </div>
      );
    }
    return <span className="text-muted-foreground text-sm">{t('notGraded')}</span>;
  };

  const renderActions = (sub: Submission) => (
    <div className="flex justify-end gap-2">
      {sub.status === 'graded' ? (
        <>
          <Button variant="outline" size="sm" onClick={() => navigate(`/submissions/${sub.id}/grade`)}>
            <Eye className="mr-2 h-4 w-4" />
            {t('actions.view')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/submissions/${sub.id}/grade`)}>
            <Edit className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button variant="default" size="sm" onClick={() => navigate(`/submissions/${sub.id}/grade`)}>
          <Edit className="mr-2 h-4 w-4" />
          {t('actions.grade')}
        </Button>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileQuestion className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          {studentGroups.length > 0 && (
            <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
              {studentGroups.length}
            </span>
          )}
        </div>
        {studentGroups.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setShowTable(!showTable)}>
            {showTable ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {showTable ? t('hideTable') : t('showTable')} {t('table')}
          </Button>
        )}
      </div>

      {showTable && studentGroups.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
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
                const isExpanded = expandedStudents.has(group.studentId);
                const hasMultiple = group.submissions.length > 1;

                return (
                  <React.Fragment key={group.studentId}>
                    {/* Summary row */}
                    <TableRow
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => hasMultiple && toggleExpand(group.studentId)}
                    >
                      <TableCell className="w-8 pr-0">
                        {hasMultiple && (
                          <ChevronRight
                            className={`text-muted-foreground h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        )}
                      </TableCell>
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
                      <TableCell>
                        <SubmissionStatusBadge status={rep.status} />
                      </TableCell>
                      <TableCell>{renderScore(rep)}</TableCell>
                      <TableCell className="text-right">{renderActions(rep)}</TableCell>
                    </TableRow>

                    {/* Expanded attempt rows */}
                    {isExpanded &&
                      group.submissions.map((sub, idx) => {
                        const attemptNumber = group.submissions.length - idx;
                        const isBest = sub.id === rep.id;
                        return (
                          <TableRow key={sub.id} className="bg-muted/40 hover:bg-muted/60">
                            <TableCell />
                            <TableCell className="py-2 pl-8">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">
                                  {t('attemptNumber', { number: attemptNumber })}
                                </span>
                                {isBest && (
                                  <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                                    {t('best')}
                                  </span>
                                )}
                                {idx === 0 && !isBest && (
                                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    {t('latest')}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell />
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Clock className="text-muted-foreground h-3 w-3" />
                                <span className="text-xs">
                                  {formatDistanceToNow(new Date(sub.submittedAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <SubmissionStatusBadge status={sub.status} />
                            </TableCell>
                            <TableCell className="py-2">{renderScore(sub)}</TableCell>
                            <TableCell className="py-2 text-right">{renderActions(sub)}</TableCell>
                          </TableRow>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
