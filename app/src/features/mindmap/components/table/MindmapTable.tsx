import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type Updater,
  type ColumnDef,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { DocumentFilters, type GroupByField } from '@/features/projects/components/DocumentFilters';
import {
  useMindmaps,
  useInfiniteMindmaps,
  useUpdateMindmapTitle,
  useDeleteMindmap,
  useUpdateMindmapChapter,
} from '@/features/mindmap/hooks';
import type { Mindmap } from '@/features/mindmap/types';
import { RenameFileDialog } from '@/shared/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import EditChapterDialog from '@/features/projects/components/EditChapterDialog';
import { toast } from 'sonner';
import { ActionButton, ActionContent } from '@/features/presentation/components';
import { formatDistance } from 'date-fns';
import { BrainCircuit, ChevronDown } from 'lucide-react';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { Badge } from '@ui/badge';
import { getSubjectName, getGradeName, getSubjectBadgeClass } from '@aiprimary/core';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';

const columnHelper = createColumnHelper<Mindmap>();

type ActiveGroupByField = Exclude<GroupByField, 'none'>;

function groupItems<T extends { grade?: string; subject?: string; chapter?: string }>(
  items: T[],
  groupBy: ActiveGroupByField,
  ungroupedLabel: string
) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item[groupBy] ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (!a ? 1 : !b ? -1 : a.localeCompare(b)))
    .map(([key, items]) => ({ key, items }));
}

const MindmapTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [selectedMindmap, setSelectedMindmap] = useState<Mindmap | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const isGrouped = groupBy !== 'none';

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';
  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const {
    data: pagedData,
    isLoading: pagedLoading,
    sorting,
    setSorting,
    pagination,
    setPagination,
    search,
    setSearch,
    totalItems,
    documentFilters,
    setDocumentFilters,
  } = useMindmaps();

  const handleFiltersChange = (next: typeof documentFilters) => {
    setDocumentFilters(next);
    if (next.grade && next.subject) {
      setGroupBy('chapter');
    } else if (groupBy === 'chapter') {
      setGroupBy('none');
    }
  };

  const {
    mindmaps: infiniteData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
  } = useInfiniteMindmaps(isGrouped);

  const data = isGrouped ? infiniteData : pagedData;
  const isLoading = isGrouped ? infiniteLoading : pagedLoading;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isGrouped) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isGrouped, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getGroupLabel = (key: string, field: GroupByField) => {
    if (!key) return tProjects('groupBy.ungrouped');
    if (field === 'grade') return getGradeName(key);
    if (field === 'subject') return getSubjectName(key);
    return key;
  };

  const groups = useMemo(
    () =>
      isGrouped
        ? groupItems(data as Mindmap[], groupBy as ActiveGroupByField, tProjects('groupBy.ungrouped'))
        : null,
    [data, groupBy, isGrouped, tProjects]
  );

  const updateMindmapTitleMutation = useUpdateMindmapTitle();
  const deleteMindmapMutation = useDeleteMindmap();
  const updateMindmapChapter = useUpdateMindmapChapter();

  const columns = useMemo(
    () => [
      columnHelper.accessor('thumbnail', {
        header: t('mindmap.thumbnail'),
        size: 178,
        cell: (info) => {
          const thumbnail = info.getValue();
          if (thumbnail && typeof thumbnail === 'string') {
            return (
              <img
                src={thumbnail}
                alt="Mindmap Thumbnail"
                className="aspect-video w-[160px] rounded border object-contain"
              />
            );
          }
          return (
            <div className="flex aspect-video w-[160px] items-center justify-center rounded border bg-purple-50 dark:bg-purple-950/40">
              <BrainCircuit className="h-8 w-8 text-purple-500" />
            </div>
          );
        },
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.accessor('title', {
        header: t('mindmap.title'),
        cell: (info) => info.getValue(),
        minSize: 200,
        meta: { isGrow: true },
        enableSorting: true,
      }),
      columnHelper.accessor('grade', {
        header: t('mindmap.grade'),
        cell: (info) => {
          const grade = info.getValue();
          return grade ? (
            <Badge variant="outline">{getGradeName(grade)}</Badge>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          );
        },
        size: 120,
        enableSorting: false,
      }),
      columnHelper.accessor('subject', {
        header: t('mindmap.subject'),
        cell: (info) => {
          const subject = info.getValue();
          return subject ? (
            <Badge variant="outline" className={getSubjectBadgeClass(subject)}>
              {getSubjectName(subject)}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          );
        },
        size: 150,
        enableSorting: false,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('mindmap.updatedAt'),
        cell: (info) =>
          info.getValue()
            ? formatDistance(new Date(info.getValue()), new Date(), {
                addSuffix: true,
                locale: getLocaleDateFns(),
              })
            : '',
        minSize: 100,
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => {
          const mindmap = info.row.original;
          return (
            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
              <ActionButton
                onViewDetail={() => navigate(`/mindmap/${mindmap.id}`)}
                onDelete={() => handleDelete(mindmap)}
                onRename={() => {
                  setSelectedMindmap(mindmap);
                  setIsRenameOpen(true);
                }}
                onEditChapter={() => {
                  setSelectedMindmap(mindmap);
                  setIsEditChapterOpen(true);
                }}
              />
            </div>
          );
        },
        size: 90,
        enableResizing: false,
        enableSorting: false,
      }),
    ],
    [t]
  );

  const tableData = useMemo(() => (pagedData ? pagedData.map((d) => ({ ...d })) : []), [pagedData]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: { sorting, pagination },
    rowCount: totalItems,
    onSortingChange: setSorting as any as (updaterOrValue: Updater<SortingState>) => void,
    onPaginationChange: setPagination as any as (updaterOrValue: Updater<PaginationState>) => void,
  });

  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      data: pagedData ? pagedData.map((d) => ({ ...d })) : [],
    }));
  }, [pagedData, table]);

  const handleRename = async (id: string, newName: string) => {
    try {
      await updateMindmapTitleMutation.mutateAsync({ id, name: newName });
      setSelectedMindmap((prev) => (prev ? { ...prev, title: newName } : prev));
      toast.success(t('mindmap.renameSuccess', { filename: newName }));
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

  const filtersNode = (
    <DocumentFilters
      filters={documentFilters}
      onChange={handleFiltersChange}
      searchQuery={search}
      onSearchChange={setSearch}
      searchPlaceholder={t('mindmap.searchPlaceholder')}
      groupBy={groupBy}
      onGroupByChange={setGroupBy}
      RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
    />
  );

  const dialogs = (
    <>
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
      <EditChapterDialog
        open={isEditChapterOpen}
        onOpenChange={setIsEditChapterOpen}
        initialValues={{
          grade: selectedMindmap?.grade,
          subject: selectedMindmap?.subject,
          chapter: selectedMindmap?.chapter,
        }}
        onSave={(values) => {
          if (!selectedMindmap) return;
          updateMindmapChapter.mutate(
            { id: selectedMindmap.id, ...values },
            { onSuccess: () => setIsEditChapterOpen(false) }
          );
        }}
        isPending={updateMindmapChapter.isPending}
      />
    </>
  );

  if (!isGrouped) {
    return (
      <div className="w-full space-y-4">
        {filtersNode}
        <DataTable
          table={table}
          isLoading={isLoading}
          onClickRow={(row) => navigate(`/mindmap/${row.original.id}`, { replace: false })}
          rowStyle="transition cursor-pointer"
          emptyState={<div className="text-muted-foreground">{t('mindmap.emptyState')}</div>}
          contextMenu={(row) => (
            <ActionContent
              onViewDetail={() => navigate(`/mindmap/${row.original.id}`)}
              onDelete={() => handleDelete(row.original)}
              onRename={() => {
                setSelectedMindmap(row.original);
                setIsRenameOpen(true);
              }}
              onEditChapter={() => {
                setSelectedMindmap(row.original);
                setIsEditChapterOpen(true);
              }}
            />
          )}
        />
        {dialogs}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {filtersNode}
      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center text-sm">...</div>
      ) : data.length === 0 ? (
        <div className="text-muted-foreground">{t('mindmap.emptyState')}</div>
      ) : (
        <div className="space-y-8">
          {groups!.map(({ key, items }) => (
            <MindmapGroupSection
              key={key}
              label={getGroupLabel(key, groupBy)}
              items={items}
              columns={columns as ColumnDef<Mindmap, any>[]}
              sorting={sorting}
              onSortingChange={setSorting as any}
              onRowClick={(m) => navigate(`/mindmap/${m.id}`, { replace: false })}
              onDelete={handleDelete}
              onRename={(m) => {
                setSelectedMindmap(m);
                setIsRenameOpen(true);
              }}
              onEditChapter={(m) => {
                setSelectedMindmap(m);
                setIsEditChapterOpen(true);
              }}
            />
          ))}
        </div>
      )}
      <div ref={sentinelRef} className="py-2 text-center">
        {isFetchingNextPage && <span className="text-muted-foreground text-sm">...</span>}
      </div>
      {dialogs}
    </div>
  );
};

function MindmapGroupSection({
  label,
  items,
  columns,
  sorting,
  onSortingChange,
  onRowClick,
  onDelete,
  onRename,
  onEditChapter,
}: {
  label: string;
  items: Mindmap[];
  columns: ColumnDef<Mindmap, any>[];
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
  onRowClick: (m: Mindmap) => void;
  onDelete: (m: Mindmap) => void;
  onRename: (m: Mindmap) => void;
  onEditChapter: (m: Mindmap) => void;
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
          contextMenu={(row) => (
            <ActionContent
              onViewDetail={() => onRowClick(row.original)}
              onDelete={() => onDelete(row.original)}
              onRename={() => onRename(row.original)}
              onEditChapter={() => onEditChapter(row.original)}
            />
          )}
        />
      )}
    </div>
  );
}

export default MindmapTable;
