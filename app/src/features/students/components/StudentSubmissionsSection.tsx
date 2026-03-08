import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Eye, FileText } from 'lucide-react';
import { Button } from '@ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { SubmissionStatusBadge } from '@/features/submission/components';
import type { StudentSubmission } from '../types';

interface StudentSubmissionsSectionProps {
  submissions: StudentSubmission[];
  isLoading?: boolean;
}

export const StudentSubmissionsSection = ({
  submissions,
  isLoading = false,
}: StudentSubmissionsSectionProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'studentDetail' });

  const columns: ColumnDef<StudentSubmission>[] = [
    {
      accessorKey: 'assignmentTitle',
      header: t('submissions.columns.assignment'),
      cell: ({ row }) => <div className="font-medium">{row.getValue('assignmentTitle') || '-'}</div>,
    },
    {
      accessorKey: 'submittedAt',
      header: t('submissions.columns.submitted'),
      cell: ({ row }) => {
        const submittedAt = row.getValue('submittedAt') as string | null | undefined;
        return (
          <div className="text-sm">
            {submittedAt ? format(new Date(submittedAt), 'P', { locale: getLocaleDateFns() }) : '-'}
          </div>
        );
      },
    },
    {
      id: 'score',
      header: t('submissions.columns.score'),
      cell: ({ row }) => {
        const { score, maxScore } = row.original;
        if (score == null) return <div className="text-muted-foreground text-sm">-</div>;
        return (
          <div className="text-sm font-medium">
            {score % 1 === 0 ? score : score.toFixed(1)}
            {maxScore != null && <span className="text-muted-foreground">/{maxScore}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('submissions.columns.status'),
      cell: ({ row }) => <SubmissionStatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: t('submissions.columns.actions'),
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/submissions/${row.original.id}/grade`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('submissions.title')}</h2>
      </div>

      {isLoading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.id ?? (col as { accessorKey?: string }).accessorKey}>&nbsp;</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.id ?? (col as { accessorKey?: string }).accessorKey}>
                      <div className="bg-muted h-4 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border">
          <FileText className="text-muted-foreground mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">{t('submissions.empty')}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
