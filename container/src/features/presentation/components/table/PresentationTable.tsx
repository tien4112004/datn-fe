import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Presentation } from '../../types/presentation';
import { usePresentations, useUpdatePresentationTitle } from '../../hooks/useApi';
import DataTable from '@/components/table/DataTable';
import { ActionContent } from './ActionButton';
import { SearchBar } from '../../../../shared/components/common/SearchBar';
import { useNavigate } from 'react-router-dom';
import ThumbnailWrapper from '../others/ThumbnailWrapper';
import * as React from 'react';
import { RenameFileDialog } from '@/shared/components/modals/RenameFileDialog';

const PresentationTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Presentation>();

  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('presentation.id'),
        cell: (info) => info.getValue(),
        size: 90,
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.display({
        header: t('presentation.thumbnail'),
        cell: (info) => {
          const presentation = info.row.original;

          if (presentation.thumbnail && typeof presentation.thumbnail === 'object') {
            return <ThumbnailWrapper slide={presentation.thumbnail} size={160} visible={true} />;
          } else if (typeof presentation.thumbnail === 'string') {
            return <img src={presentation.thumbnail} alt="Presentation Thumbnail" className={`w-[160px]`} />;
          } else if (presentation.slides && presentation.slides[0]) {
            return <ThumbnailWrapper slide={presentation.slides[0]} size={160} visible={true} />;
          } else {
            return (
              <img
                src="/images/placeholder-image.webp"
                alt="No Thumbnail"
                className={`aspect-[16/9] w-full`}
              />
            );
          }
        },
        size: 176,
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.accessor('title', {
        header: t('presentation.title'),
        cell: (info) => info.getValue(),
        minSize: 200,
        meta: {
          isGrow: true,
        },
        enableSorting: true,
      }),
      columnHelper.accessor('createdAt', {
        header: t('presentation.createdAt'),
        cell: (info) => formatDate(info.getValue()),
        size: 160,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('presentation.updatedAt'),
        cell: (info) => formatDate(info.getValue()),
        size: 160,
        enableSorting: false,
      }),
    ],
    [t, formatDate]
  );

  const { data, isLoading, sorting, setSorting, pagination, setPagination, totalItems, search, setSearch } =
    usePresentations();
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [selectedPresentation, setSelectedPresentation] = React.useState<Presentation | null>(null);
  const updatePresentationTitle = useUpdatePresentationTitle();
  const table = useReactTable({
    data: [...data],
    columns: columns,
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
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  return (
    <div className="w-full space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t('presentation.searchPlaceholder', 'Search presentations...')}
        className="w-full rounded-lg border-2 border-slate-200"
      />
      <DataTable
        table={table}
        isLoading={isLoading}
        emptyState={<div className="text-muted-foreground">{t('presentation.emptyState')}</div>}
        contextMenu={(row) => (
          <ActionContent
            onViewDetail={() => {
              navigate(`/presentation/${row.original.id}`);
            }}
            onEdit={() => {
              console.log('Edit', row.original);
            }}
            onDelete={() => {
              console.log('Delete', row.original);
            }}
            onRename={() => {
              setSelectedPresentation(row.original);
              setIsRenameOpen(true);
            }}
          />
        )}
      />
      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        presentation={selectedPresentation}
        isLoading={updatePresentationTitle.isPending}
        onRename={async (id: string, newName: string) => {
          await updatePresentationTitle.mutateAsync({ id, name: newName });
        }}
      />
    </div>
  );
};

export default PresentationTable;
