import { useState, useMemo } from 'react';
import {
  Loader2,
  FolderOpen,
  BrainCircuit,
  Presentation,
  ClipboardList,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useClassResources } from '../hooks';
import { Badge } from '@ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { getGradeName, getSubjectName, getSubjectBadgeClass } from '@aiprimary/core';
import { DocumentFilters, type GroupByField } from '@/features/projects/components/DocumentFilters';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import type { LinkedResourceResponse, LinkedResourceType } from '@/features/projects/types/resource';
import { PermissionBadge } from '@/shared/components/common/PermissionBadge';
import { useDebounce } from '@/shared/hooks/useDebounce';
import DataTable from '@/shared/components/table/DataTable';

interface ClassResourcesTabProps {
  classId: string;
}

const resourceTypeRoutes: Record<LinkedResourceType, string> = {
  mindmap: '/mindmap',
  presentation: '/presentation',
  assignment: '/assignment',
};

const resourceTypeIcons: Record<LinkedResourceType, React.ElementType> = {
  mindmap: BrainCircuit,
  presentation: Presentation,
  assignment: ClipboardList,
};

const resourceTypeBgColors: Record<LinkedResourceType, string> = {
  presentation: 'bg-amber-50',
  mindmap: 'bg-purple-50',
  assignment: 'bg-blue-50',
};

type ActiveGroupByField = Exclude<GroupByField, 'none'>;

function groupResources(
  items: LinkedResourceResponse[],
  groupBy: ActiveGroupByField
): { key: string; items: LinkedResourceResponse[] }[] {
  const groups = new Map<string, LinkedResourceResponse[]>();
  for (const item of items) {
    const key = item[groupBy] ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (!a ? 1 : !b ? -1 : a.localeCompare(b)))
    .map(([key, groupItems]) => ({ key, items: groupItems }));
}

function getGroupLabel(key: string, field: ActiveGroupByField, ungroupedLabel: string) {
  if (!key) return ungroupedLabel;
  if (field === 'grade') return getGradeName(key);
  if (field === 'subject') return getSubjectName(key);
  return key;
}

function getResourceRoute(resource: LinkedResourceResponse) {
  const base = resourceTypeRoutes[resource.type];
  const isStudent = window.location.pathname.startsWith('/student');
  return `${isStudent ? '/student' : ''}${base}/${resource.id}`;
}

function ResourceGridCard({ resource }: { resource: LinkedResourceResponse }) {
  const href = getResourceRoute(resource);
  const Icon = resourceTypeIcons[resource.type];
  const bgColor = resourceTypeBgColors[resource.type];
  const badgePermission = resource.permissionLevel === 'view' ? 'read' : resource.permissionLevel;
  const showBadge = (resource.type === 'presentation' || resource.type === 'mindmap') && badgePermission;

  return (
    <Link
      to={href}
      className="hover:bg-muted/50 bg-card group flex flex-col rounded-lg border p-3 transition-colors sm:p-4"
    >
      <div className="bg-muted mb-2 aspect-video w-full overflow-hidden rounded-md sm:mb-3">
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title ?? ''}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full items-center justify-center rounded-md ${bgColor}`}>
            <Icon className="text-muted-foreground h-8 w-8 sm:h-12 sm:w-12" />
          </div>
        )}
      </div>
      <h3 className="mb-1 line-clamp-2 text-xs font-medium sm:text-sm">{resource.title}</h3>
      <div className="mt-auto flex flex-wrap gap-1 pt-1">
        {resource.grade && (
          <Badge variant="outline" className="text-xs">
            {getGradeName(resource.grade)}
          </Badge>
        )}
        {resource.subject && (
          <Badge variant="outline" className={`text-xs ${getSubjectBadgeClass(resource.subject)}`}>
            {getSubjectName(resource.subject)}
          </Badge>
        )}
        {showBadge && <PermissionBadge permission={badgePermission as 'read' | 'comment' | 'edit'} />}
      </div>
    </Link>
  );
}

const columnHelper = createColumnHelper<LinkedResourceResponse>();

function ResourcesTable({
  data,
  navigate,
}: {
  data: LinkedResourceResponse[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { t } = useTranslation('classes', { keyPrefix: 'resources.tab' });
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'icon',
        header: '',
        cell: (info) => {
          const Icon = resourceTypeIcons[info.row.original.type];
          return <Icon className="text-muted-foreground h-4 w-4" />;
        },
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.accessor('title', {
        header: t('table.title'),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        minSize: 200,
        meta: { isGrow: true },
        enableSorting: false,
      }),
      columnHelper.accessor('type', {
        header: t('table.type'),
        cell: (info) => {
          const type = info.getValue();
          const Icon = resourceTypeIcons[type];
          return (
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs capitalize">{type}</span>
            </div>
          );
        },
        size: 120,
        enableSorting: false,
      }),
      columnHelper.accessor('grade', {
        header: t('table.grade'),
        cell: (info) => {
          const grade = info.getValue();
          if (!grade) return <span className="text-muted-foreground text-xs">-</span>;
          return (
            <Badge variant="outline" className="text-xs">
              {getGradeName(grade)}
            </Badge>
          );
        },
        size: 90,
        enableSorting: false,
      }),
      columnHelper.accessor('subject', {
        header: t('table.subject'),
        cell: (info) => {
          const subject = info.getValue();
          if (!subject) return <span className="text-muted-foreground text-xs">-</span>;
          return (
            <Badge variant="outline" className={`text-xs ${getSubjectBadgeClass(subject)}`}>
              {getSubjectName(subject)}
            </Badge>
          );
        },
        size: 120,
        enableSorting: false,
      }),
      columnHelper.accessor('chapter', {
        header: t('table.chapter'),
        cell: (info) => <span className="text-muted-foreground text-xs">{info.getValue() ?? '-'}</span>,
        minSize: 100,
        meta: { isGrow: true },
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'open',
        header: '',
        cell: (info) => (
          <Link
            to={getResourceRoute(info.row.original)}
            className="flex justify-center"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <ExternalLink className="text-muted-foreground h-4 w-4" />
          </Link>
        ),
        size: 50,
        minSize: 50,
        maxSize: 50,
        enableResizing: false,
        enableSorting: false,
      }),
    ],
    [t]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <DataTable
      table={table}
      isLoading={false}
      emptyState={null}
      showPagination={false}
      onClickRow={(row) => navigate(getResourceRoute(row.original))}
      rowStyle="transition cursor-pointer"
    />
  );
}

function ResourceTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation('classes', { keyPrefix: 'resources.tab' });
  return (
    <Select value={value || 'all'} onValueChange={(v) => onChange(v === 'all' ? '' : v)}>
      <SelectTrigger className="w-40 shrink-0">
        <SelectValue>
          {value === 'presentation'
            ? t('types.presentations')
            : value === 'mindmap'
              ? t('types.mindmaps')
              : t('types.all')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('types.all')}</SelectItem>
        <SelectItem value="presentation">{t('types.presentations')}</SelectItem>
        <SelectItem value="mindmap">{t('types.mindmaps')}</SelectItem>
      </SelectContent>
    </Select>
  );
}

function GroupSection({
  label,
  items,
  viewMode,
  navigate,
}: {
  label: string;
  items: LinkedResourceResponse[];
  viewMode: ViewMode;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [collapsed, setCollapsed] = useState(false);

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
      {!collapsed &&
        (viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5">
            {items.map((r) => (
              <ResourceGridCard key={`${r.type}:${r.id}`} resource={r} />
            ))}
          </div>
        ) : (
          <ResourcesTable data={items} navigate={navigate} />
        ))}
    </div>
  );
}

export const ClassResourcesTab = ({ classId }: ClassResourcesTabProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'resources.tab' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [docFilters, setDocFilters] = useState<{
    grade?: string;
    subject?: string;
    chapter?: string;
  }>({});

  const debouncedSearch = useDebounce(searchInput, 300);

  const { resources, loading, error } = useClassResources(classId, {
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
  });

  const isGrouped = groupBy !== 'none';

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (docFilters.grade && r.grade !== docFilters.grade) return false;
      if (docFilters.subject && r.subject !== docFilters.subject) return false;
      if (docFilters.chapter && r.chapter !== docFilters.chapter) return false;
      return true;
    });
  }, [resources, docFilters]);

  const groups = useMemo(() => {
    if (!isGrouped) return null;
    return groupResources(filteredResources, groupBy as ActiveGroupByField);
  }, [filteredResources, groupBy, isGrouped]);

  const handleFiltersChange = (next: typeof docFilters) => {
    setDocFilters(next);
    if (next.grade && next.subject) {
      setGroupBy('chapter');
    } else if (groupBy === 'chapter') {
      setGroupBy('none');
    }
  };

  const filtersNode = (
    <DocumentFilters
      filters={docFilters}
      onChange={handleFiltersChange}
      searchQuery={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder={t('searchPlaceholder')}
      groupBy={groupBy}
      onGroupByChange={setGroupBy}
      RightComponent={
        <div className="flex items-center gap-2">
          <ResourceTypeSelect value={typeFilter} onChange={setTypeFilter} />
          <ViewToggle value={viewMode} onValueChange={setViewMode} />
        </div>
      }
    />
  );

  if (loading) {
    return (
      <div className="w-full space-y-4">
        {filtersNode}
        <div className="flex h-48 items-center justify-center">
          <div className="text-muted-foreground flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        {filtersNode}
        <div className="flex h-48 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive font-medium">{t('error')}</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredResources.length === 0) {
    return (
      <div className="w-full space-y-4">
        {filtersNode}
        <div className="flex h-48 items-center justify-center">
          <div className="text-center">
            <FolderOpen className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">{t('empty.title')}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{t('empty.description')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {filtersNode}

      {isGrouped ? (
        <div className="space-y-8">
          {groups!.map(({ key, items }) => (
            <GroupSection
              key={key}
              label={getGroupLabel(key, groupBy as ActiveGroupByField, tProjects('groupBy.ungrouped'))}
              items={items}
              viewMode={viewMode}
              navigate={navigate}
            />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5">
          {filteredResources.map((r) => (
            <ResourceGridCard key={`${r.type}:${r.id}`} resource={r} />
          ))}
        </div>
      ) : (
        <ResourcesTable data={filteredResources} navigate={navigate} />
      )}
    </div>
  );
};
