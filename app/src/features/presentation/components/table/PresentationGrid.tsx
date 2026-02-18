import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Presentation } from '@/features/presentation/types/presentation';
import { usePresentationManager } from '@/features/presentation/hooks/usePresentationManager';
import { Button } from '@ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { ThumbnailWrapperV2 } from '@/features/presentation/components/others/ThumbnailWrapper';
import TablePagination from '@/shared/components/table/TablePagination';
import { ActionContent } from './ActionButton';
import { RenameFileDialog } from '@/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { SkeletonGrid } from '@ui/skeleton-card';

const PresentationGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const columnHelper = createColumnHelper<Presentation>();

  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

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
    isDeleteOpen,
    setIsDeleteOpen,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    isDeletePending,
  } = usePresentationManager();

  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('title', { header: 'Title' }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: data || [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
      pagination,
    },
    rowCount: totalItems,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const PresentationCard = ({ presentation }: { presentation: Presentation }) => (
    <div className="group w-full cursor-pointer">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 transition-shadow duration-200 hover:shadow-md"
        onClick={() => navigate(`/presentation/${presentation.id}`)}
      >
        <ThumbnailWrapperV2 presentation={presentation} size={'auto'} visible={true} />

        <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 bg-white/90 p-0 hover:bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
              <ActionContent
                onViewDetail={() => navigate(`/presentation/${presentation.id}`)}
                onDelete={() => handleDelete(presentation)}
                onRename={() => handleRename(presentation)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3
          className="cursor-pointer truncate text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
          onClick={() => navigate(`/presentation/${presentation.id}`)}
        >
          {presentation.title || t('presentation.untitled')}
        </h3>
        <p className="text-xs text-gray-500">
          {t('presentation.lastModified')}: {formatDate(presentation.updatedAt)}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('presentation.searchPlaceholder')}
            className="flex-1 rounded-lg border-2 border-slate-200"
          />
          <ViewToggle value={viewMode} onValueChange={setViewMode} />
        </div>
        <SkeletonGrid count={10} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('presentation.searchPlaceholder')}
          className="flex-1 rounded-lg border-2 border-slate-200"
        />
        <ViewToggle value={viewMode} onValueChange={setViewMode} />
      </div>

      {data && data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.map((presentation) => (
              <PresentationCard key={presentation.id} presentation={presentation} />
            ))}
          </div>

          <TablePagination table={table} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-2 text-lg text-gray-500">{t('presentation.emptyState')}</div>
          <div className="text-sm text-gray-400">{t('presentation.createFirst')}</div>
        </div>
      )}

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
      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={selectedPresentation?.title || ''}
        itemType="presentation"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeletePending}
      />
    </div>
  );
};

export default PresentationGrid;
