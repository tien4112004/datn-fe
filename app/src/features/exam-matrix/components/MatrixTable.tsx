import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import DataTable from '@/shared/components/table/DataTable';
import type { ExamMatrix } from '@/features/exam-matrix/types';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface MatrixTableProps {
  matrices: ExamMatrix[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowClick: (matrix: ExamMatrix) => void;
}

const columnHelper = createColumnHelper<ExamMatrix>();

export const MatrixTable = ({
  matrices,
  isLoading,
  selectedIds,
  onSelectionChange,
  onRowClick,
}: MatrixTableProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);

  const columns = useMemo(
    () => [
      // Selection checkbox
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              if (value) {
                onSelectionChange(matrices.map((m) => m.id));
              } else {
                onSelectionChange([]);
              }
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={(value) => {
              if (value) {
                onSelectionChange([...selectedIds, row.original.id]);
              } else {
                onSelectionChange(selectedIds.filter((id) => id !== row.original.id));
              }
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      }),

      // Name
      columnHelper.accessor('name', {
        header: t('columns.name'),
        cell: (info) => (
          <div className="max-w-md truncate font-medium" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        enableSorting: false,
      }),

      // Subject
      columnHelper.accessor('subjectCode', {
        header: t('columns.subject'),
        cell: (info) => (
          <Badge variant="outline" className="text-xs font-medium">
            {t(`subjects.${info.getValue()}`)}
          </Badge>
        ),
        enableSorting: false,
        size: 120,
      }),

      // Target Points
      columnHelper.accessor('targetTotalPoints', {
        header: t('columns.targetPoints'),
        cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
        enableSorting: false,
        size: 120,
      }),

      // Topic Count
      columnHelper.accessor('topics', {
        header: t('columns.topicCount'),
        cell: (info) => <span className="text-muted-foreground text-sm">{info.getValue().length}</span>,
        enableSorting: false,
        size: 100,
      }),

      // Cell Count
      columnHelper.accessor('cells', {
        header: t('columns.cellCount'),
        cell: (info) => <span className="text-muted-foreground text-sm">{info.getValue().length}</span>,
        enableSorting: false,
        size: 100,
      }),

      // Created date
      columnHelper.accessor('createdAt', {
        header: t('columns.createdAt'),
        cell: (info) => {
          const date = info.getValue();
          return date ? (
            <span className="text-muted-foreground text-sm">{new Date(date).toLocaleDateString()}</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
        enableSorting: false,
        size: 120,
      }),
    ],
    [selectedIds, matrices, onSelectionChange, t]
  );

  const table = useReactTable({
    data: matrices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      onClickRow={(row) => onRowClick(row.original)}
      emptyState={
        <div className="p-8 text-center">
          <p className="text-muted-foreground">{t('emptyState')}</p>
        </div>
      }
      className="rounded-lg border"
    />
  );
};
