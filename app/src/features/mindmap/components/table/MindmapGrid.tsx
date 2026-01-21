import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Mindmap } from '@/features/mindmap/types';
import { useMindmaps, useUpdateMindmapTitle, useDeleteMindmap } from '@/features/mindmap/hooks';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SearchBar } from '@/shared/components/common/SearchBar';
import TablePagination from '@/shared/components/table/TablePagination';
import { ActionContent } from '@/features/presentation/components';
import { RenameFileDialog } from '@/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { SkeletonGrid } from '@/shared/components/ui/skeleton-card';

const MindmapGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const columnHelper = createColumnHelper<Mindmap>();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMindmap, setSelectedMindmap] = useState<Mindmap | null>(null);

  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  // Use the same hook as MindmapTable
  const { data, isLoading, sorting, setSorting, pagination, setPagination, search, setSearch, totalItems } =
    useMindmaps();

  const updateMindmapTitleMutation = useUpdateMindmapTitle();
  const deleteMindmapMutation = useDeleteMindmap();

  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '';
    return format(new Date(date), 'E, P', { locale: getLocaleDateFns() });
  }, []);

  // Create dummy columns for table instance (required for pagination)
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('title', { header: 'Title' }),
    ],
    [columnHelper]
  );

  // Create table instance for pagination component
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
      );
    } catch (error) {
      toast.error(t('renameError'));
      console.error('Failed to rename mindmap:', error);
    }
  };

  const handleDelete = (mindmap: Mindmap) => {
    setSelectedMindmap(mindmap);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMindmap) return;

    try {
      await deleteMindmapMutation.mutateAsync(selectedMindmap.id);
      toast.success(t('mindmap.deleteSuccess', { name: selectedMindmap.title }));
      setIsDeleteOpen(false);
      setSelectedMindmap(null);
    } catch (error) {
      toast.error(t('mindmap.deleteError'));
      console.error('Failed to delete mindmap:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteOpen(false);
    setSelectedMindmap(null);
  };

  const handleOpenRename = (mindmap: Mindmap) => {
    setSelectedMindmap(mindmap);
    setIsRenameOpen(true);
  };

  // Inline card component
  const MindmapCard = ({ mindmap }: { mindmap: Mindmap }) => (
    <div className="group w-full cursor-pointer">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 transition-shadow duration-200 hover:shadow-md"
        onClick={() => navigate(`/mindmap/${mindmap.id}`)}
      >
        {/* Thumbnail Image */}
        <img
          src={mindmap.thumbnail || '/images/placeholder-image.webp'}
          alt={mindmap.title || 'Mindmap Thumbnail'}
          className="aspect-video w-full rounded-lg object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder-image.webp';
          }}
        />

        {/* Action Menu (appears on hover) */}
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
                onViewDetail={() => navigate(`/mindmap/${mindmap.id}`)}
                onDelete={() => handleDelete(mindmap)}
                onRename={() => handleOpenRename(mindmap)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-3 space-y-1">
        <h3
          className="cursor-pointer truncate text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
          onClick={() => navigate(`/mindmap/${mindmap.id}`)}
        >
          {mindmap.title || t('mindmap.untitled')}
        </h3>
        <p className="text-xs text-gray-500">
          {t('mindmap.lastModified')}: {formatDate(mindmap.updatedAt)}
        </p>
      </div>
    </div>
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('mindmap.searchPlaceholder')}
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
          onChange={handleSearchChange}
          placeholder={t('mindmap.searchPlaceholder')}
          className="flex-1 rounded-lg border-2 border-slate-200"
        />
        <ViewToggle value={viewMode} onValueChange={setViewMode} />
      </div>

      {data && data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.map((mindmap) => (
              <MindmapCard key={mindmap.id} mindmap={mindmap} />
            ))}
          </div>

          <TablePagination table={table} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-2 text-lg text-gray-500">{t('mindmap.emptyState')}</div>
          <div className="text-sm text-gray-400">{t('mindmap.createFirst')}</div>
        </div>
      )}

      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
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
      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={selectedMindmap?.title || ''}
        itemType="mindmap"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteMindmapMutation.isPending}
      />
    </div>
  );
};

export default MindmapGrid;
