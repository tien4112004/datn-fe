import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@ui/badge';
import { BrainCircuit, Presentation, ClipboardList, ChevronDown } from 'lucide-react';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { useAllDocuments, useInfiniteAllDocuments } from '@/features/dashboard/hooks';
import type { DocumentItem } from '@/features/dashboard/api/types';
import { DocumentFilters, type GroupByField } from '@/features/projects/components/DocumentFilters';
import { SkeletonGrid } from '@ui/skeleton-card';
import { getGradeName, getSubjectName } from '@aiprimary/core';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mindmap: BrainCircuit,
  presentation: Presentation,
  assignment: ClipboardList,
};

type ActiveGroupByField = Exclude<GroupByField, 'none'>;

function groupDocuments(documents: DocumentItem[], groupBy: GroupByField, ungroupedLabel: string) {
  if (groupBy === 'none') return null;

  const groups = new Map<string, DocumentItem[]>();
  const activeGroupBy = groupBy as ActiveGroupByField;

  for (const doc of documents) {
    const key = doc[activeGroupBy] ?? '';
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

const AllResourcesGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const [search, setSearch] = useState('');
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
    sort: 'desc' as const,
    filter: search || undefined,
    subject: documentFilters.subject,
    grade: documentFilters.grade,
    chapter: documentFilters.chapter,
  };

  // Paginated fetch for normal (ungrouped) mode
  const { documents: pagedDocuments, isLoading: pagedLoading } = useAllDocuments({
    ...sharedParams,
    page: 1,
    pageSize: 20,
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

  const handleCardClick = (item: DocumentItem) => {
    const path =
      item.type === 'mindmap'
        ? `/mindmap/${item.id}`
        : item.type === 'assignment'
          ? `/assignment/${item.id}`
          : `/presentation/${item.id}`;
    navigate(path);
  };

  const groups = useMemo(
    () => groupDocuments(documents, groupBy, tProjects('groupBy.ungrouped')),
    [documents, groupBy, tProjects]
  );

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

  const ResourceCard = ({ item }: { item: DocumentItem }) => {
    const Icon = TYPE_ICONS[item.type] ?? Presentation;
    const typeLabel =
      item.type === 'mindmap'
        ? tProjects('resources.mindmap')
        : item.type === 'assignment'
          ? tProjects('resources.assignment')
          : tProjects('resources.presentation');

    return (
      <div className="group w-full cursor-pointer" onClick={() => handleCardClick(item)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 transition-shadow duration-200 hover:shadow-md">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title || 'Thumbnail'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-muted/50 flex h-full w-full items-center justify-center">
              <Icon className="text-muted-foreground h-12 w-12" />
            </div>
          )}
          <div className="absolute left-2 top-2">
            <Badge variant="outline" className="bg-white/90 text-xs">
              {typeLabel}
            </Badge>
          </div>
        </div>
        <div className="mt-3">
          <h3 className="truncate text-sm font-medium">{item.title || t('sharedResources.untitled')}</h3>
        </div>
      </div>
    );
  };

  const ResourceGrid = ({ items }: { items: DocumentItem[] }) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <ResourceCard key={item.id} item={item} />
      ))}
    </div>
  );

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

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {filtersNode}
        <SkeletonGrid count={10} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {filtersNode}
      {documents.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">{t('allResources.emptyState')}</div>
      ) : groups ? (
        <div className="space-y-8">
          {groups.map(({ key, items }) => (
            <GridGroupSection key={key} label={getGroupLabel(key, groupBy, items)} items={items}>
              <ResourceGrid items={items} />
            </GridGroupSection>
          ))}
          <div ref={sentinelRef} className="py-2 text-center">
            {isFetchingNextPage && <span className="text-muted-foreground text-sm">...</span>}
          </div>
        </div>
      ) : (
        <ResourceGrid items={documents} />
      )}
    </div>
  );
};

function GridGroupSection({
  label,
  items,
  children,
}: {
  label: string;
  items: DocumentItem[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="space-y-3">
      <button onClick={() => setCollapsed((v) => !v)} className="flex w-full items-center gap-2 text-left">
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        />
        <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          {label}
          <span className="ml-2 font-normal normal-case">({items.length})</span>
        </h2>
      </button>
      {!collapsed && children}
    </div>
  );
}

export default AllResourcesGrid;
