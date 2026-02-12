import { useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { useAssignmentList } from '@/features/assignment/hooks/useAssignmentApi';
import type { Assignment } from '../../types';
import { RenameFileDialog } from '@/shared/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import { toast } from 'sonner';
import { ActionContent } from '@/features/presentation/components';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';

const columnHelper = createColumnHelper<Assignment>();

const AssignmentTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  // Fetch assignments
  const { data: assignmentsResponse, isLoading } = useAssignmentList({
    searchText: search,
  });

  const data = useMemo(() => assignmentsResponse?.assignments || [], [assignmentsResponse]);
  const totalItems = assignmentsResponse?.total || 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: t('assignment.title'),
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
        minSize: 200,
        meta: { isGrow: true },
        enableSorting: true,
      }),

      columnHelper.accessor('createdAt', {
        header: t('assignment.createdAt'),
        cell: (info) =>
          info.getValue() ? format(new Date(info.getValue()!), 'E, P', { locale: getLocaleDateFns() }) : '',
        size: 180,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('assignment.updatedAt'),
        cell: (info) =>
          info.getValue() ? format(new Date(info.getValue()!), 'E, P', { locale: getLocaleDateFns() }) : '',
        size: 180,
      }),
    ],
    [t]
  );

  // Clone data to ensure fresh references for table
  const tableData = useMemo(() => data.map((d) => ({ ...d })), [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: {
      sorting,
      pagination,
    },
    rowCount: totalItems,
    onSortingChange: setSorting as any as (updaterOrValue: Updater<SortingState>) => void,
    onPaginationChange: setPagination as any as (updaterOrValue: Updater<PaginationState>) => void,
  });

  // Ensure table uses latest data by updating options when data changes
  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      data: data.map((d) => ({ ...d })),
    }));
  }, [data, table]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleRename = async (_id: string, newName: string) => {
    try {
      // TODO: Implement update assignment title mutation
      setSelectedAssignment((prev) => (prev ? { ...prev, title: newName } : prev));
      toast.success(t('assignment.renameSuccess'));
      setIsRenameOpen(false);
    } catch (error) {
      toast.error(t('renameError'));
      console.error('Failed to rename assignment:', error);
    }
  };

  const handleDelete = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;

    try {
      // TODO: Implement delete assignment mutation
      toast.success(t('assignment.deleteSuccess', { name: selectedAssignment.title }));
      setIsDeleteOpen(false);
      setSelectedAssignment(null);
    } catch (error) {
      toast.error(t('assignment.deleteError'));
      console.error('Failed to delete assignment:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteOpen(false);
    setSelectedAssignment(null);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder={t('assignment.searchPlaceholder')}
          className="flex-1 rounded-lg border-2 border-slate-200"
        />
        <ViewToggle value={viewMode} onValueChange={setViewMode} />
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onClickRow={(row) => {
          navigate(`/assignment/${row.original.id}`, { replace: false });
        }}
        rowStyle="transition cursor-pointer"
        emptyState={<div className="text-muted-foreground">{t('assignment.emptyState')}</div>}
        contextMenu={(row) => (
          <ActionContent
            onViewDetail={() => {
              navigate(`/assignment/${row.original.id}`);
            }}
            onDelete={() => {
              handleDelete(row.original);
            }}
            onRename={() => {
              setSelectedAssignment(row.original);
              setIsRenameOpen(true);
            }}
          />
        )}
      />

      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={(o) => setIsRenameOpen(o)}
        project={{
          id: selectedAssignment?.id || '',
          filename: selectedAssignment?.title || '',
          projectType: 'assignment',
        }}
        renameDialogTitle={t('assignment.renameFileDialogTitle')}
        renameDuplicatedMessage={t('assignment.renameDuplicatedMessage')}
        placeholder={t('assignment.title')}
        isLoading={false}
        onRename={handleRename}
      />
      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={selectedAssignment?.title || ''}
        itemType="assignment"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={false}
      />
    </div>
  );
};

export default AssignmentTable;
