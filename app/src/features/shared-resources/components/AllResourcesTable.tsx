import { useMemo, useState, useEffect, useRef } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { SortingState, PaginationState, ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { Badge } from '@ui/badge';
import { BrainCircuit, Presentation, ClipboardList, ChevronDown } from 'lucide-react';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { useAllDocuments, useInfiniteAllDocuments } from '@/features/dashboard/hooks';
import type { DocumentItem } from '@/features/dashboard/api/types';
import { formatDistance } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { DocumentFilters, type GroupByField } from '@/features/projects/components/DocumentFilters';
import { getGradeName, getSubjectName } from '@aiprimary/core';

const columnHelper = createColumnHelper<DocumentItem>();

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mindmap: BrainCircuit,
  presentation: Presentation,
  assignment: ClipboardList,
};

const TYPE_COLORS: Record<string, string> = {
  presentation: 'bg-amber-50 dark:bg-amber-950/40',
  mindmap: 'bg-purple-50 dark:bg-purple-950/40',
  assignment: 'bg-blue-50 dark:bg-blue-950/40',
};

const TYPE_ICON_COLORS: Record<string, string> = {
  presentation: 'text-amber-500',
  mindmap: 'text-purple-500',
  assignment: 'text-blue-500',
};

type ActiveGroupByField = Exclude<GroupByField, 'none'>;

function groupDocuments(documents: DocumentItem[], groupBy: ActiveGroupByField, ungroupedLabel: string) {
  const groups = new Map<string, DocumentItem[]>();

  for (const doc of documents) {
    const key = doc[groupBy] ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(doc);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    })
    .map(([key, items]) => ({ key, label: key || ungroupedLabel, items }));
}

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
  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const [documentFilters, setDocumentFilters] = useState<{
    subject?: string;
    grade?: string;
    chapter?: string;
  }>({});

  const handleFiltersChange = (next: typeof documentFilters) => {
    setDocumentFilters(next);
    if (next.grade && next.subject) {
      setGroupBy('chapter');
    } else if (groupBy === 'chapter') {
      setGroupBy('none');
    }
  };

  const isGrouped = groupBy !== 'none';

  const sharedParams = {
    sort: sorting[0]?.desc ? 'desc' : 'asc',
    filter: search || undefined,
    subject: documentFilters.subject,
    grade: documentFilters.grade,
    chapter: documentFilters.chapter,
  };

  // Paginated fetch for normal (ungrouped) mode
  const {
    documents: pagedDocuments,
    totalItems,
    isLoading: pagedLoading,
  } = useAllDocuments({
    ...sharedParams,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    enabled: !isGrouped,
  });

  // Infinite fetch for grouped mode
  const {
    documents: infiniteDocuments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
  } = useInfiniteAllDocuments({ ...sharedParams, enabled: isGrouped });

  const documents = isGrouped ? infiniteDocuments : pagedDocuments;
  const isLoading = isGrouped ? infiniteLoading : pagedLoading;

  // Sentinel ref for infinite scroll (grouped mode only)
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isGrouped) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isGrouped, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getGroupLabel = (key: string, field: GroupByField, items: DocumentItem[]) => {
    if (!key) return tProjects('groupBy.ungrouped');
    if (field === 'grade') return getGradeName(key);
    if (field === 'subject') return getSubjectName(key);
    if (field === 'chapter') {
      const sample = items[0];
      const parts: string[] = [];
      if (sample?.grade && !documentFilters.grade) parts.push(getGradeName(sample.grade));
      if (sample?.subject && !documentFilters.subject) parts.push(getSubjectName(sample.subject));
      return parts.length > 0 ? `${parts.join(' · ')} — ${key}` : key;
    }
    return key;
  };

  const groups = useMemo(
    () =>
      isGrouped
        ? groupDocuments(documents, groupBy as ActiveGroupByField, tProjects('groupBy.ungrouped'))
        : null,
    [documents, groupBy, isGrouped, tProjects]
  );

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
            <div
              className={`flex aspect-video w-[120px] items-center justify-center rounded border ${TYPE_COLORS[type] ?? 'bg-muted/50'}`}
            >
              <Icon className={`h-8 w-8 ${TYPE_ICON_COLORS[type] ?? 'text-muted-foreground'}`} />
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

  const handleRowClick = (item: DocumentItem) => {
    const path =
      item.type === 'mindmap'
        ? `/mindmap/${item.id}`
        : item.type === 'assignment'
          ? `/assignment/${item.id}`
          : `/presentation/${item.id}`;
    navigate(path);
  };

  // Table for non-grouped mode (with pagination)
  const table = useReactTable({
    data: pagedDocuments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: { sorting, pagination },
    rowCount: totalItems,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const filtersNode = (
    <DocumentFilters
      filters={documentFilters}
      onChange={handleFiltersChange}
      searchQuery={search}
      onSearchChange={setSearch}
      searchPlaceholder={t('allResources.searchPlaceholder')}
      groupBy={groupBy}
      onGroupByChange={setGroupBy}
      RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
    />
  );

  if (!isGrouped) {
    return (
      <div className="w-full space-y-4">
        {filtersNode}
        <DataTable
          table={table}
          isLoading={isLoading}
          onClickRow={(row) => handleRowClick(row.original)}
          rowStyle="transition cursor-pointer"
          emptyState={<div className="text-muted-foreground">{t('allResources.emptyState')}</div>}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {filtersNode}
      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center text-sm">...</div>
      ) : documents.length === 0 ? (
        <div className="text-muted-foreground">{t('allResources.emptyState')}</div>
      ) : (
        <div className="space-y-8">
          {groups!.map(({ key, items }) => (
            <GroupSection
              key={key}
              label={getGroupLabel(key, groupBy, items)}
              items={items}
              columns={columns}
              sorting={sorting}
              onSortingChange={setSorting}
              onRowClick={handleRowClick}
            />
          ))}
        </div>
      )}
      <div ref={sentinelRef} className="py-2 text-center">
        {isFetchingNextPage && <span className="text-muted-foreground text-sm">...</span>}
      </div>
    </div>
  );
};

// Separate component so each group can have its own table instance
function GroupSection({
  label,
  items,
  columns,
  sorting,
  onSortingChange,
  onRowClick,
}: {
  label: string;
  items: DocumentItem[];
  columns: ColumnDef<DocumentItem, any>[];
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
  onRowClick: (item: DocumentItem) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting },
    onSortingChange,
  });

  return (
    <div className="space-y-2">
      <button onClick={() => setCollapsed((v) => !v)} className="flex w-full items-center gap-2 text-left">
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        />
        <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          {label}
          <span className="ml-2 font-normal normal-case">({items.length})</span>
        </h2>
      </button>
      {!collapsed && (
        <DataTable
          table={table}
          isLoading={false}
          onClickRow={(row) => onRowClick(row.original)}
          rowStyle="transition cursor-pointer"
          showPagination={false}
          emptyState={null}
        />
      )}
    </div>
  );
}

export default AllResourcesTable;
