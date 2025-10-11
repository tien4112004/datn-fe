import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { useMindmaps, useUpdateMindmapTitle } from '@/features/mindmap/hooks';
import type { MindmapData } from '@/features/mindmap/types/service';
import { RenameFileDialog } from '@/shared/components/modals/RenameFileDialog';
import { toast } from 'sonner';
import { ActionContent } from '@/features/presentation/components';

const columnHelper = createColumnHelper<MindmapData>();

const MindmapTable: React.FC = () => {
  const { t: tc } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tm } = useTranslation('mindmap');
  const navigate = useNavigate();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedMindmap, setSelectedMindmap] = useState<MindmapData | null>(null);

  // Use the new hook
  const { data, isLoading, sorting, setSorting, pagination, setPagination, search, setSearch, totalItems } =
    useMindmaps();

  const updateMindmapTitleMutation = useUpdateMindmapTitle();

  const formatDate = useCallback((d: string | undefined) => {
    if (!d) return '';
    return new Date(d).toLocaleString();
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: tc('presentation.id', 'ID'),
        size: 90,
        cell: (info) => info.getValue(),
        enableResizing: true,
        enableSorting: false,
      }),
      columnHelper.accessor('title', {
        header: tc('presentation.title', 'Title'),
        cell: (info) => info.getValue(),
        minSize: 200,
        meta: { isGrow: true },
        enableSorting: true,
      }),
      columnHelper.accessor('nodes', {
        header: tc('nodes', 'Nodes'),
        cell: (info) => (info.getValue() ? (info.getValue() as any).length : 0),
        enableSorting: false,
        size: 100,
      }),
      columnHelper.accessor('edges', {
        header: tc('edges', 'Edges'),
        cell: (info) => (info.getValue() ? (info.getValue() as any).length : 0),
        enableSorting: false,
        size: 100,
      }),
      columnHelper.accessor('createdAt', {
        header: tc('presentation.createdAt', 'Created At'),
        cell: (info) => formatDate(info.getValue()),
        size: 180,
      }),
      columnHelper.accessor('updatedAt', {
        header: tc('presentation.updatedAt', 'Last modified'),
        cell: (info) => formatDate(info.getValue()),
        size: 180,
      }),
    ],
    [tc, formatDate]
  );

  // Clone data to ensure fresh references for table
  const tableData = useMemo(() => (data ? data.map((d) => ({ ...d })) : []), [data]);

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
      data: data ? data.map((d) => ({ ...d })) : [],
    }));
  }, [data, table]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleRename = async (id: string, newName: string) => {
    try {
      await updateMindmapTitleMutation.mutateAsync({ id, name: newName });
      setSelectedMindmap((prev) => (prev ? { ...prev, title: newName } : prev));
      toast.success(tm('list.renameSuccess', 'Renamed successfully')); // TODO: move to hook, set i18n
    } catch (error) {
      toast.error(tc('renameError', 'Failed to rename mindmap'));
      console.error('Failed to rename mindmap:', error);
    }
  };

  return (
    <div className="w-full space-y-4">
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder={tm('list.searchBarPlaceholder')}
        className="w-full rounded-lg border-2 border-slate-200"
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyState={<div className="text-muted-foreground">{tc('emptyState', 'No mindmaps found')}</div>}
        contextMenu={(row) => (
          <ActionContent
            onViewDetail={() => {
              navigate(`/mindmap/${row.original.id}`);
            }}
            onEdit={() => {
              console.log('Edit', row.original);
            }}
            onDelete={() => {
              console.log('Delete', row.original);
            }}
            onRename={() => {
              setSelectedMindmap(row.original);
              setIsRenameOpen(true);
            }}
          />
        )}
      />

      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={(o) => setIsRenameOpen(o)}
        project={{
          id: selectedMindmap?.id || '',
          filename: selectedMindmap?.title || '',
          projectType: tc('mindmap', 'mindmap'),
        }}
        renameDialogTitle={tm('list.renameFileDialogTitle', 'Rename Mindmap')}
        isLoading={updateMindmapTitleMutation.isPending}
        onRename={handleRename}
      />
    </div>
  );
};

export default MindmapTable;
