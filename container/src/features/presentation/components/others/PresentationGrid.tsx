import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Presentation } from '@/features/presentation/types/presentation';
import { usePresentations } from '@/features/presentation/hooks/useApi';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchBar } from '@/shared/components/common/SearchBar';
import ThumbnailWrapper from '@/features/presentation/components/others/ThumbnailWrapper';
import TablePagination from '@/shared/components/table/TablePagination';

const PresentationGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Presentation>();

  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }, []);

  const { data, isLoading, sorting, setSorting, pagination, setPagination, totalItems, search, setSearch } =
    usePresentations();

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
    <div className="group cursor-pointer">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 transition-shadow duration-200 hover:shadow-md"
        onClick={() => navigate(`/presentation/${presentation.id}`)}
      >
        {presentation.slides && presentation.slides[0] ? (
          <div className="flex h-full items-center justify-center">
            <ThumbnailWrapper slide={presentation.slides[0]} size={300} visible={true} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200 text-gray-500">
            {t('presentation.noThumbnail', 'No thumbnail')}
          </div>
        )}

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
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/presentation/${presentation.id}`);
                }}
              >
                {t('actionButton.viewDetails', 'View Details')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Edit', presentation);
                }}
              >
                {t('actionButton.edit', 'Edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete', presentation);
                }}
                className="text-red-600 focus:text-red-600"
              >
                {t('actionButton.delete', 'Delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3
          className="cursor-pointer truncate text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
          onClick={() => navigate(`/presentation/${presentation.id}`)}
        >
          {presentation.title || t('presentation.untitled', 'Untitled Presentation')}
        </h3>
        <p className="text-xs text-gray-500">
          {t('presentation.lastModified', 'Last modified')}: {formatDate(presentation.updatedAt)}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('presentation.searchPlaceholder', 'Search presentations...')}
          className="w-full rounded-lg border-2 border-slate-200"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="mb-3 aspect-video w-full rounded-lg bg-gray-200" />
              <div className="mb-2 h-4 rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t('presentation.searchPlaceholder', 'Search presentations...')}
        className="w-full rounded-lg border-2 border-slate-200"
      />

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
          <div className="text-sm text-gray-400">
            {t('presentation.createFirst', 'Create your first presentation to get started')}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationGrid;
