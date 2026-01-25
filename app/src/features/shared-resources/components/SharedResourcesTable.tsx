import { useMemo } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { SearchBar } from '@/shared/components/common/SearchBar';
import { useSharedResources } from '../hooks';
import type { SharedResource } from '../types';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Presentation } from 'lucide-react';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { useState } from 'react';

const columnHelper = createColumnHelper<SharedResource>();

const SharedResourcesTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const { data, isLoading } = useSharedResources();

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const searchLower = search.toLowerCase();
    return data.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchLower) || item.ownerName?.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('thumbnailUrl', {
        header: t('sharedResources.thumbnail'),
        size: 176,
        cell: (info) => {
          const thumbnail = info.getValue();
          const type = info.row.original.type;
          const Icon = type === 'mindmap' ? BrainCircuit : Presentation;

          if (thumbnail && typeof thumbnail === 'string') {
            return (
              <img
                src={thumbnail}
                alt="Resource Thumbnail"
                className="aspect-video w-[120px] rounded border object-cover"
              />
            );
          }
          return (
            <div className="bg-muted/50 flex aspect-video w-[120px] items-center justify-center rounded border">
              <Icon className="text-muted-foreground h-8 w-8" />
            </div>
          );
        },
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.accessor('title', {
        header: t('sharedResources.title'),
        cell: (info) => info.getValue() || t('sharedResources.untitled'),
        minSize: 200,
        meta: { isGrow: true },
        enableSorting: false,
      }),
      columnHelper.accessor('type', {
        header: t('sharedResources.type'),
        size: 140,
        cell: (info) => {
          const type = info.getValue();
          return (
            <Badge variant={type === 'mindmap' ? 'default' : 'secondary'}>
              {type === 'mindmap' ? tProjects('resources.mindmap') : tProjects('resources.presentation')}
            </Badge>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor('ownerName', {
        header: t('sharedResources.owner'),
        size: 180,
        cell: (info) => info.getValue() || 'Unknown',
        enableSorting: false,
      }),
      columnHelper.accessor('permission', {
        header: t('sharedResources.permission'),
        size: 140,
        cell: (info) => {
          const permission = info.getValue();
          const permissionLabel =
            permission === 'comment'
              ? t('sharedResources.permissionComment')
              : t('sharedResources.permissionRead');
          return <Badge variant="outline">{permissionLabel}</Badge>;
        },
        enableSorting: false,
      }),
    ],
    [t, tProjects]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: false,
    manualSorting: false,
  });

  const handleRowClick = (resource: SharedResource) => {
    const path = resource.type === 'mindmap' ? `/mindmap/${resource.id}` : `/presentation/${resource.id}`;
    navigate(path);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('sharedResources.searchPlaceholder')}
          className="flex-1 rounded-lg border-2 border-slate-200"
        />
        <ViewToggle value={viewMode} onValueChange={setViewMode} />
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onClickRow={(row) => handleRowClick(row.original)}
        rowStyle="transition cursor-pointer"
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-2 text-lg">{t('sharedResources.emptyState')}</div>
            <div className="text-muted-foreground/70 text-sm">{t('sharedResources.emptyStateHint')}</div>
          </div>
        }
      />
    </div>
  );
};

export default SharedResourcesTable;
