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
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const PresentationTable = () => {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Presentation>();

  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }, []);

  // Callback for forcing data refresh
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['presentations'],
      refetchType: 'active',
    });
  }, []);

  // Add a manual refresh trigger
  React.useEffect(() => {
    window.addEventListener('forceRefreshPresentations', refreshData);
    return () => {
      window.removeEventListener('forceRefreshPresentations', refreshData);
    };
  }, [refreshData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('presentation.id'),
        cell: (info) => info.getValue(),
        size: 90,
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.accessor('slides', {
        header: t('presentation.thumbnail'),
        // cell: () => <img src="https://placehold.co/600x400" alt="" className="h-16 w-16 object-cover" />,
        cell: (info) => {
          const slides = info.getValue();
          return slides && slides[0] ? (
            <ThumbnailWrapper slide={slides[0]} size={160} visible={true} />
          ) : null;
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
        enableSorting: false,
      }),
      columnHelper.accessor('isParsed', {
        header: 'isParsed (Dev Only)',
        cell: (info) => (info.getValue() ? 'true' : 'false'),
        enableSorting: false,
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
  const queryClient = useQueryClient();
  const table = useReactTable({
    data: data || [],
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
        currentName={selectedPresentation?.title || ''}
        isLoading={updatePresentationTitle.isPending}
        onRename={(newName) => {
          if (!selectedPresentation) return;

          updatePresentationTitle.mutate(
            { id: selectedPresentation.id, name: newName },
            {
              onSuccess: () => {
                setIsRenameOpen(false);

                // Update local selected presentation state
                setSelectedPresentation((prev) => {
                  return prev ? { ...prev, title: newName } : null;
                });

                // We need to create a new array reference to force table to rerender
                const updatedData = data.map((presentation) =>
                  presentation.id === selectedPresentation.id
                    ? { ...presentation, title: newName }
                    : presentation
                );

                // Force the table to update by setting new data directly
                table.setOptions((prev) => ({
                  ...prev,
                  data: updatedData,
                }));

                toast.success(`Presentation renamed to "${newName}" successfully`);
              },
              onError: (error) => {
                console.error('Failed to rename presentation:', error);

                // Get a user-friendly error message
                let errorMessage = 'Unknown error occurred';
                if (error instanceof Error) {
                  errorMessage = error.message;
                } else if (typeof error === 'string') {
                  errorMessage = error;
                } else if (
                  error &&
                  typeof error === 'object' &&
                  'message' in (error as Record<string, unknown>)
                ) {
                  errorMessage = String((error as Record<string, unknown>).message);
                }

                // Show error notification
                toast.error(`Failed to rename presentation: ${errorMessage}`);
              },
            }
          );
        }}
        checkDuplicate={(name) =>
          // call api to check due to pagiation -> not all filename fetched
          !!data?.some(
            (p) => p.id !== selectedPresentation?.id && p.title.toLowerCase() === name.toLowerCase()
          )
        }
      />
    </div>
  );
};

export default PresentationTable;
