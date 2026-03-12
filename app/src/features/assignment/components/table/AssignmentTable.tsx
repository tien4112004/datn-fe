import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type Updater,
  type ColumnDef,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { DocumentFilters, type GroupByField } from '@/features/projects/components/DocumentFilters';
import { useAssignmentListStore } from '@/features/assignment/stores/useAssignmentListStore';
import {
  useAssignmentList,
  useInfiniteAssignmentList,
  useDeleteAssignment,
  useUpdateAssignmentChapter,
} from '@/features/assignment/hooks/useAssignmentApi';
import type { Assignment } from '../../types';
import { RenameFileDialog } from '@/shared/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import EditChapterDialog from '@/features/projects/components/EditChapterDialog';
import { toast } from 'sonner';
import { ActionButton, ActionContent } from '@/features/presentation/components';
import { formatDistance } from 'date-fns';
import { ExportAssignmentPdfDialog } from '@/features/assignment/components/export/ExportAssignmentPdfDialog';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { Badge } from '@ui/badge';
import { getSubjectName, getGradeName, getSubjectBadgeClass } from '@aiprimary/core';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { ChevronDown } from 'lucide-react';

const columnHelper = createColumnHelper<Assignment>();

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

const AssignmentTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const { t: tProjects } = useTranslation('projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const isGrouped = groupBy !== 'none';

  const { search, documentFilters, pagination, setSearch, setDocumentFilters, setPagination } =
    useAssignmentListStore();

  const handleFiltersChange = (next: typeof documentFilters) => {
    setDocumentFilters(next);
    if (next.grade && next.subject) {
      setGroupBy('chapter');
    } else if (groupBy === 'chapter') {
      setGroupBy('none');
    }
  };

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';
  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  const { data: assignmentsResponse, isLoading: pagedLoading } = useAssignmentList({
    searchText: search,
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    grade: documentFilters.grade,
    subject: documentFilters.subject,
    chapter: documentFilters.chapter,
    enabled: !isGrouped,
  } as any);

  const {
    assignments: infiniteData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
  } = useInfiniteAssignmentList({
    searchText: search,
    grade: documentFilters.grade,
    subject: documentFilters.subject,
    chapter: documentFilters.chapter,
    enabled: isGrouped,
  });

  const pagedAssignments = useMemo(() => assignmentsResponse?.assignments || [], [assignmentsResponse]);
  const totalItems = assignmentsResponse?.total || 0;
  const data = isGrouped ? infiniteData : pagedAssignments;
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
        ? groupItems(data as Assignment[], groupBy as ActiveGroupByField, tProjects('groupBy.ungrouped'))
        : null,
    [data, groupBy, isGrouped, tProjects]
  );

  const deleteAssignment = useDeleteAssignment();
  const updateAssignmentChapter = useUpdateAssignmentChapter();

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: t('assignment.title'),
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
        minSize: 200,
        meta: { isGrow: true },
      }),
      columnHelper.accessor('subject', {
        header: t('assignment.subject'),
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
        size: 120,
      }),
      columnHelper.accessor('grade', {
        header: t('assignment.grade'),
        cell: (info) => {
          const grade = info.getValue();
          return grade ? (
            <Badge variant="outline">{getGradeName(grade)}</Badge>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('assignment.updatedAt'),
        cell: (info) =>
          info.getValue()
            ? formatDistance(new Date(info.getValue()!), new Date(), {
                addSuffix: true,
                locale: getLocaleDateFns(),
              })
            : '',
        minSize: 100,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('actions'),
        cell: (info) => {
          const assignment = info.row.original;
          return (
            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
              <ActionButton
                onViewDetail={() => navigate(`/assignment/${assignment.id}`)}
                onDelete={() => handleDelete(assignment)}
                onRename={() => {
                  setSelectedAssignment(assignment);
                  setIsRenameOpen(true);
                }}
                onEditChapter={() => {
                  setSelectedAssignment(assignment);
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

  const tableData = useMemo(() => pagedAssignments.map((d) => ({ ...d })), [pagedAssignments]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableSorting: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: { pagination },
    rowCount: totalItems,
    onPaginationChange: setPagination as any as (updaterOrValue: Updater<PaginationState>) => void,
  });

  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      data: pagedAssignments.map((d) => ({ ...d })),
    }));
  }, [pagedAssignments, table]);

  const handleRename = async (_id: string, newName: string) => {
    try {
      setSelectedAssignment((prev) => (prev ? { ...prev, title: newName } : prev));
      toast.success(t('assignment.renameSuccess'));
      setIsRenameOpen(false);
    } catch (error) {
      toast.error(t('renameError'));
      console.error('Failed to rename assignment:', error);
    }
  };

  const handleDelete = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;
    try {
      await deleteAssignment.mutateAsync(selectedAssignment.id);
      toast.success(t('assignment.deleteSuccess', { name: selectedAssignment.title }));
      setIsDeleteOpen(false);
      setSelectedAssignment(null);
    } catch (error) {
      toast.error(t('assignment.deleteError'));
      console.error('Failed to delete assignment:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteOpen(false);
    setSelectedAssignment(null);
  };

  const filtersNode = (
    <DocumentFilters
      filters={documentFilters}
      onChange={handleFiltersChange}
      searchQuery={search}
      onSearchChange={setSearch}
      searchPlaceholder={t('assignment.searchPlaceholder')}
      groupBy={groupBy}
      onGroupByChange={setGroupBy}
      RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
    />
  );

  const dialogs = (
    <>
      <ExportAssignmentPdfDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        assignmentId={selectedAssignment?.id || ''}
        assignmentTitle={selectedAssignment?.title || ''}
      />
      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        project={{
          id: selectedAssignment?.id || '',
          filename: selectedAssignment?.title || '',
          projectType: 'assignment',
        }}
        renameDialogTitle={t('assignment.renameFileDialogTitle')}
        renameDuplicatedMessage={t('assignment.renameDuplicatedMessage')}
        placeholder={t('assignment.title')}
        isLoading={false}
        onRename={handleRename}
      />
      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={selectedAssignment?.title || ''}
        itemType="assignment"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={false}
      />
      <EditChapterDialog
        open={isEditChapterOpen}
        onOpenChange={setIsEditChapterOpen}
        initialValues={{
          grade: selectedAssignment?.grade,
          subject: selectedAssignment?.subject,
          chapter: selectedAssignment?.chapter,
        }}
        onSave={(values) => {
          if (!selectedAssignment) return;
          updateAssignmentChapter.mutate(
            { id: selectedAssignment.id, ...values },
            { onSuccess: () => setIsEditChapterOpen(false) }
          );
        }}
        isPending={updateAssignmentChapter.isPending}
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
          onClickRow={(row) => navigate(`/assignment/${row.original.id}`, { replace: false })}
          rowStyle="transition cursor-pointer"
          emptyState={<div className="text-muted-foreground">{t('assignment.emptyState')}</div>}
          contextMenu={(row) => (
            <ActionContent
              onViewDetail={() => navigate(`/assignment/${row.original.id}`)}
              onDelete={() => handleDelete(row.original)}
              onRename={() => {
                setSelectedAssignment(row.original);
                setIsRenameOpen(true);
              }}
              onEditChapter={() => {
                setSelectedAssignment(row.original);
                setIsEditChapterOpen(true);
              }}
              onExport={() => {
                setSelectedAssignment(row.original);
                setIsExportOpen(true);
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
        <div className="text-muted-foreground">{t('assignment.emptyState')}</div>
      ) : (
        <div className="space-y-8">
          {groups!.map(({ key, items }) => (
            <AssignmentGroupSection
              key={key}
              label={getGroupLabel(key, groupBy)}
              items={items}
              columns={columns as ColumnDef<Assignment, any>[]}
              onRowClick={(a) => navigate(`/assignment/${a.id}`, { replace: false })}
              onDelete={handleDelete}
              onRename={(a) => {
                setSelectedAssignment(a);
                setIsRenameOpen(true);
              }}
              onEditChapter={(a) => {
                setSelectedAssignment(a);
                setIsEditChapterOpen(true);
              }}
              onExport={(a) => {
                setSelectedAssignment(a);
                setIsExportOpen(true);
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

function AssignmentGroupSection({
  label,
  items,
  columns,
  onRowClick,
  onDelete,
  onRename,
  onEditChapter,
  onExport,
}: {
  label: string;
  items: Assignment[];
  columns: ColumnDef<Assignment, any>[];
  onRowClick: (a: Assignment) => void;
  onDelete: (a: Assignment) => void;
  onRename: (a: Assignment) => void;
  onEditChapter: (a: Assignment) => void;
  onExport: (a: Assignment) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
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
              onExport={() => onExport(row.original)}
            />
          )}
        />
      )}
    </div>
  );
}

export default AssignmentTable;
