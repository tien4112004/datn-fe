import { useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { SortingState, PaginationState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { Badge } from '@ui/badge';
import { BrainCircuit, Presentation, ClipboardList } from 'lucide-react';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { useAllDocuments } from '@/features/dashboard/hooks';
import type { DocumentItem } from '@/features/dashboard/api/types';
import { formatDistance } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { DocumentFilters } from '@/features/projects/components/DocumentFilters';

const columnHelper = createColumnHelper<DocumentItem>();

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mindmap: BrainCircuit,
  presentation: Presentation,
  assignment: ClipboardList,
};

const AllResourcesTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';
  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [documentFilters, setDocumentFilters] = useState<{
    subject?: string;
    grade?: string;
    chapter?: string;
  }>({});

  const { documents, totalItems, isLoading } = useAllDocuments({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort: sorting[0]?.desc ? 'desc' : 'asc',
    filter: search || undefined,
    subject: documentFilters.subject,
    grade: documentFilters.grade,
    chapter: documentFilters.chapter,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('thumbnail', {
        header: t('sharedResources.thumbnail'),
        size: 150,
        minSize: 150,
        maxSize: 150,
        cell: (info) => {
          const thumbnail = info.getValue();
          const type = info.row.original.type;
          const Icon = TYPE_ICONS[type] ?? Presentation;

          if (thumbnail) {
            return (
              <img
                src={thumbnail}
                alt="Thumbnail"
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
        enableSorting: true,
      }),
      columnHelper.accessor('type', {
        header: t('sharedResources.type'),
        size: 150,
        cell: (info) => {
          const type = info.getValue();
          const label =
            type === 'mindmap'
              ? tProjects('resources.mindmap')
              : type === 'assignment'
                ? tProjects('resources.assignment')
                : tProjects('resources.presentation');
          return <Badge variant="outline">{label}</Badge>;
        },
        enableSorting: false,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('presentation.updatedAt'),
        size: 160,
        cell: (info) => {
          const val = info.getValue();
          return val
            ? formatDistance(new Date(val), new Date(), { addSuffix: true, locale: getLocaleDateFns() })
            : '';
        },
        enableSorting: false,
      }),
    ],
    [t, tProjects]
  );

  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: { sorting, pagination },
    rowCount: totalItems,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const handleRowClick = (item: DocumentItem) => {
    const path =
      item.type === 'mindmap'
        ? `/mindmap/${item.id}`
        : item.type === 'assignment'
          ? `/assignment/${item.id}`
          : `/presentation/${item.id}`;
    navigate(path);
  };

  return (
    <div className="w-full space-y-4">
      <DocumentFilters
        filters={documentFilters}
        onChange={setDocumentFilters}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('allResources.searchPlaceholder')}
        RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
      />
      <DataTable
        table={table}
        isLoading={isLoading}
        onClickRow={(row) => handleRowClick(row.original)}
        rowStyle="transition cursor-pointer"
        emptyState={<div className="text-muted-foreground">{t('allResources.emptyState')}</div>}
      />
    </div>
  );
};

export default AllResourcesTable;
