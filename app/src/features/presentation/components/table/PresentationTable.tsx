import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { SortingState, ColumnDef } from '@tanstack/react-table';
import type { Presentation } from '../../types/presentation';
import { usePresentationManager } from '../../hooks/usePresentationManager';
import { useUpdatePresentationChapter, useInfinitePresentations } from '../../hooks/useApi';
import DataTable from '@/components/table/DataTable';
import ActionButton, { ActionContent } from './ActionButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DocumentFilters, type GroupByField } from '@/features/projects/components/DocumentFilters';
import { ThumbnailWrapperV2 } from '../others/ThumbnailWrapper';
import { RenameFileDialog } from '@/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import EditChapterDialog from '@/features/projects/components/EditChapterDialog';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { formatDistance } from 'date-fns';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { Badge } from '@ui/badge';
import { getSubjectName, getGradeName, getSubjectBadgeClass } from '@aiprimary/core';
import { ChevronDown } from 'lucide-react';

type ActiveGroupByField = Exclude<GroupByField, 'none'>;

function groupItems<T extends { grade?: string; subject?: string; chapter?: string }>(
  items: T[],
  groupBy: ActiveGroupByField,
  _ungroupedLabel: string
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

const PresentationTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const columnHelper = createColumnHelper<Presentation>();

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';
  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const isGrouped = groupBy !== 'none';

  const {
    data: pagedData,
    isLoading: pagedLoading,
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
    setSelectedPresentation,
    handleRename,
    handleConfirmRename,
    isRenamePending,
    isDeleteOpen,
    setIsDeleteOpen,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    isDeletePending,
    documentFilters,
    setDocumentFilters,
  } = usePresentationManager();

  const handleFiltersChange = (next: typeof documentFilters) => {
    setDocumentFilters(next);
    if (next.grade && next.subject) {
      setGroupBy('chapter');
    } else if (groupBy === 'chapter') {
      setGroupBy('none');
    }
  };

  const {
    presentations: infiniteData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
  } = useInfinitePresentations(isGrouped);

  const data = isGrouped ? infiniteData : pagedData;
  const isLoading = isGrouped ? infiniteLoading : pagedLoading;

  // Sentinel for infinite scroll when grouped
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

  const getGroupLabel = (key: string, field: GroupByField, items: Presentation[]) => {
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
        ? groupItems(data as Presentation[], groupBy as ActiveGroupByField, tProjects('groupBy.ungrouped'))
        : null,
    [data, groupBy, isGrouped, tProjects]
  );

  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const updatePresentationChapter = useUpdatePresentationChapter();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'thumbnail',
        header: t('presentation.thumbnail'),
        cell: (info) => {
          const presentation = info.row.original;
          return <ThumbnailWrapperV2 presentation={presentation} size={'auto'} visible={true} />;
        },
        size: 150,
        minSize: 150,
        maxSize: 150,
        enableResizing: false,
        enableSorting: false,
      }),
      columnHelper.accessor('title', {
        header: t('presentation.title'),
        cell: (info) => info.getValue(),
        minSize: 200,
        meta: { isGrow: true },
        enableSorting: true,
      }),
      columnHelper.accessor('grade', {
        header: t('presentation.grade'),
        cell: (info) => {
          const grade = info.getValue();
          return grade ? (
            <Badge variant="outline">{getGradeName(grade)}</Badge>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          );
        },
        size: 80,
        enableSorting: false,
      }),
      columnHelper.accessor('subject', {
        header: t('presentation.subject'),
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
        size: 110,
        enableSorting: false,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('presentation.updatedAt'),
        cell: (info) =>
          info.getValue()
            ? formatDistance(new Date(info.getValue() as Date), new Date(), {
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
          const presentation = info.row.original;
          return (
            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
              <ActionButton
                onViewDetail={() => navigate(`/presentation/${presentation.id}`)}
                onDelete={() => handleDelete(presentation)}
                onRename={() => handleRename(presentation)}
                onEditChapter={() => {
                  setSelectedPresentation(presentation);
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

  const initialColumnSizing = useMemo(
    () => ({ thumbnail: 150, title: 400, grade: 80, subject: 110, updatedAt: 150, actions: 50 }),
    []
  );

  const table = useReactTable({
    data: pagedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    initialState: { columnSizing: initialColumnSizing },
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
      searchPlaceholder={t('presentation.searchPlaceholder')}
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
      <EditChapterDialog
        open={isEditChapterOpen}
        onOpenChange={setIsEditChapterOpen}
        initialValues={{
          grade: selectedPresentation?.grade,
          subject: selectedPresentation?.subject,
          chapter: selectedPresentation?.chapter,
        }}
        onSave={(values) => {
          if (!selectedPresentation) return;
          updatePresentationChapter.mutate(
            { id: selectedPresentation.id, ...values },
            { onSuccess: () => setIsEditChapterOpen(false) }
          );
        }}
        isPending={updatePresentationChapter.isPending}
      />
    </>
  );

  if (!isGrouped) {
    return (
      <div className="w-full space-y-4">
        {filtersNode}
        <DataTable
          className="w-full"
          table={table}
          isLoading={isLoading}
          onClickRow={(row) => navigate(`/presentation/${row.original.id}`, { replace: false })}
          rowStyle="transition cursor-pointer"
          emptyState={<div className="text-muted-foreground">{t('presentation.emptyState')}</div>}
          contextMenu={(row) => (
            <ActionContent
              onViewDetail={() => navigate(`/presentation/${row.original.id}`, { replace: false })}
              onDelete={() => handleDelete(row.original)}
              onRename={() => handleRename(row.original)}
              onEditChapter={() => {
                setSelectedPresentation(row.original);
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
        <div className="text-muted-foreground">{t('presentation.emptyState')}</div>
      ) : (
        <div className="space-y-8">
          {groups!.map(({ key, items }) => (
            <GroupSection
              key={key}
              label={getGroupLabel(key, groupBy, items)}
              items={items}
              columns={columns as ColumnDef<Presentation, any>[]}
              sorting={sorting}
              onSortingChange={setSorting}
              onRowClick={(p) => navigate(`/presentation/${p.id}`, { replace: false })}
              onDelete={handleDelete}
              onRename={handleRename}
              onEditChapter={(p) => {
                setSelectedPresentation(p);
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

function GroupSection({
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
  items: Presentation[];
  columns: ColumnDef<Presentation, any>[];
  sorting: SortingState;
  onSortingChange: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void;
  onRowClick: (p: Presentation) => void;
  onDelete: (p: Presentation) => void;
  onRename: (p: Presentation) => void;
  onEditChapter: (p: Presentation) => void;
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

export default PresentationTable;
