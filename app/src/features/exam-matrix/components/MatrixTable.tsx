import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import DataTable from '@/shared/components/table/DataTable';
import type { ExamMatrix } from '@/features/exam-matrix/types';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { FileX2, MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';

interface MatrixTableProps {
  matrices: ExamMatrix[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowClick: (matrix: ExamMatrix) => void;
  onEdit?: (matrix: ExamMatrix) => void;
  onDuplicate?: (matrixId: string) => void;
  onDelete?: (matrixId: string) => void;
}

const columnHelper = createColumnHelper<ExamMatrix>();

export const MatrixTable = ({
  matrices,
  isLoading,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onEdit,
  onDuplicate,
  onDelete,
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

      // Actions dropdown
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(row.original);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('table.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(row.original.id);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                {t('table.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(row.original.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('table.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        size: 50,
      }),
    ],
    [selectedIds, matrices, onSelectionChange, t, onEdit, onDuplicate, onDelete]
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
        <div className="from-muted/50 animate-in fade-in bg-gradient-to-b to-transparent p-16 text-center">
          <FileX2 className="text-muted-foreground/40 mx-auto mb-4 h-16 w-16" />
          <p className="text-foreground text-lg font-semibold">{t('emptyState')}</p>
          <p className="text-muted-foreground mt-2 text-sm">{t('emptyStates.createFirstMatrix')}</p>
        </div>
      }
      className="rounded-xl border-2 shadow-sm"
    />
  );
};
