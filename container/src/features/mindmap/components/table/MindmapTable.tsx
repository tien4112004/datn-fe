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
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { useMindmaps, useUpdateMindmapTitle } from '@/features/mindmap/hooks';
import type { Mindmap } from '@/features/mindmap/types/service';
import { RenameFileDialog } from '@/shared/components/modals/RenameFileDialog';
import { toast } from 'sonner';
import { ActionContent } from '@/features/presentation/components';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';

const columnHelper = createColumnHelper<Mindmap>();

const MindmapTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedMindmap, setSelectedMindmap] = useState<Mindmap | null>(null);

  // Use the new hook
  const { data, isLoading, sorting, setSorting, pagination, setPagination, search, setSearch, totalItems } =
    useMindmaps();

  const updateMindmapTitleMutation = useUpdateMindmapTitle();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('mindmap.id'),
        size: 90,
        cell: (info) => info.getValue(),
        enableResizing: true,
        enableSorting: false,
      }),
      columnHelper.accessor('thumbnail', {
        header: t('mindmap.thumbnail'),
        size: 176,
        cell: (info) => {
          const thumbnail = info.getValue();
          if (thumbnail && typeof thumbnail === 'string') {
            return (
              <img
                src={thumbnail}
                alt="Mindmap Thumbnail"
                className="aspect-[16/9] w-[120px] rounded border object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-image.webp';
                }}
              />
            );
          }
          // Fallback placeholder
          return (
            <img
              src="/images/placeholder-image.webp"
              alt="No Thumbnail"
              className={`aspect-[16/9] w-[120px]`}
            />
          );
        },
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.accessor('title', {
        header: t('mindmap.title'),
        cell: (info) => info.getValue(),
        minSize: 200,
        meta: { isGrow: true },
        enableSorting: true,
      }),
      columnHelper.accessor('createdAt', {
        header: t('mindmap.createdAt'),
        cell: (info) => format(info.getValue(), 'E, P', { locale: getLocaleDateFns() }),
        size: 280,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('mindmap.updatedAt'),
        cell: (info) => format(info.getValue(), 'E, P', { locale: getLocaleDateFns() }),
        size: 280,
      }),
    ],
    [t]
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
      toast.success(
        t('mindmap.renameSuccess', {
          filename: newName,
        })
      ); // TODO: move to hook, set i18n
    } catch (error) {
      toast.error(t('renameError'));
      console.error('Failed to rename mindmap:', error);
    }
  };

  return (
    <div className="w-full space-y-4">
      <SearchBar
        value={search}
        onChange={handleSearchChange}
        placeholder={t('mindmap.searchPlaceholder')}
        className="w-full rounded-lg border-2 border-slate-200"
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        emptyState={<div className="text-muted-foreground">{t('mindmap.emptyState')}</div>}
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
          projectType: 'mindmap',
        }}
        renameDialogTitle={t('mindmap.renameFileDialogTitle')}
        renameDuplicatedMessage={t('mindmap.renameDuplicatedMessage')}
        placeholder={t('mindmap.title')}
        isLoading={updateMindmapTitleMutation.isPending}
        onRename={handleRename}
      />
    </div>
  );
};

export default MindmapTable;
