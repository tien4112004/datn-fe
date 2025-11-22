import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Presentation } from '../../types/presentation';
import { usePresentationManager } from '../../hooks/usePresentationManager';
import DataTable from '@/components/table/DataTable';
import { ActionContent } from './ActionButton';
import { SearchBar } from '../../../../shared/components/common/SearchBar';
import { useNavigate } from 'react-router-dom';
import ThumbnailWrapper from '../others/ThumbnailWrapper';
import { RenameFileDialog } from '@/components/modals/RenameFileDialog';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { format } from 'date-fns';

const PresentationTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Presentation>();

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
                className={`aspect-[16/9] w-[160px]`}
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
        cell: (info) =>
          info.getValue() ? format(info.getValue() as Date, 'E, P', { locale: getLocaleDateFns() }) : '',
        size: 280,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('presentation.updatedAt'),
        cell: (info) =>
          info.getValue() ? format(info.getValue() as Date, 'E, P', { locale: getLocaleDateFns() }) : '',
        size: 280,
        enableSorting: false,
      }),
    ],
    [t]
  );

  const {
    data,
    isLoading,
    sorting,
    setSorting,
    pagination,
    setPagination,
    totalItems,
    search,
    setSearch,
    isRenameOpen,
    setIsRenameOpen,
    selectedPresentation,
    handleRename,
    handleConfirmRename,
    isRenamePending,
  } = usePresentationManager();

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
        placeholder={t('presentation.searchPlaceholder')}
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
              handleRename(row.original);
            }}
          />
        )}
      />
      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        project={{
          id: selectedPresentation?.id || '',
          filename: selectedPresentation?.title || '',
          projectType: t('presentation.presentation'),
        }}
        renameDialogTitle={t('presentation.renameFileDialogTitle')}
        renameDuplicatedMessage={t('presentation.renameDuplicatedMessage')}
        placeholder={t('presentation.title')}
        isLoading={isRenamePending}
        onRename={handleConfirmRename}
      />
    </div>
  );
};

export default PresentationTable;
