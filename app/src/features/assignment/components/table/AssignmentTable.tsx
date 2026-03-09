import { useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { DocumentFilters } from '@/features/projects/components/DocumentFilters';
import { useAssignmentListStore } from '@/features/assignment/stores/useAssignmentListStore';
import {
  useAssignmentList,
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
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { Badge } from '@ui/badge';
import { getSubjectName, getGradeName, getSubjectBadgeClass } from '@aiprimary/core';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';

const columnHelper = createColumnHelper<Assignment>();

const AssignmentTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const { search, documentFilters, pagination, setSearch, setDocumentFilters, setPagination } =
    useAssignmentListStore();

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  // Fetch assignments
  const { data: assignmentsResponse, isLoading } = useAssignmentList({
    searchText: search,
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    grade: documentFilters.grade,
    subject: documentFilters.subject,
    chapter: documentFilters.chapter,
  });
  const deleteAssignment = useDeleteAssignment();
  const updateAssignmentChapter = useUpdateAssignmentChapter();

  const data = useMemo(() => assignmentsResponse?.assignments || [], [assignmentsResponse]);
  const totalItems = assignmentsResponse?.total || 0;

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

  // Clone data to ensure fresh references for table
  const tableData = useMemo(() => data.map((d) => ({ ...d })), [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableSorting: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: {
      pagination,
    },
    rowCount: totalItems,
    onPaginationChange: setPagination as any as (updaterOrValue: Updater<PaginationState>) => void,
  });

  // Ensure table uses latest data by updating options when data changes
  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      data: data.map((d) => ({ ...d })),
    }));
  }, [data, table]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleRename = async (_id: string, newName: string) => {
    try {
      // TODO: Implement update assignment title mutation
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

  return (
    <div className="w-full space-y-4">
      <DocumentFilters
        filters={documentFilters}
        onChange={setDocumentFilters}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('assignment.searchPlaceholder')}
        RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        onClickRow={(row) => {
          navigate(`/assignment/${row.original.id}`, { replace: false });
        }}
        rowStyle="transition cursor-pointer"
        emptyState={<div className="text-muted-foreground">{t('assignment.emptyState')}</div>}
        contextMenu={(row) => (
          <ActionContent
            onViewDetail={() => {
              navigate(`/assignment/${row.original.id}`);
            }}
            onDelete={() => {
              handleDelete(row.original);
            }}
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

      <ExportAssignmentPdfDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        assignmentId={selectedAssignment?.id || ''}
        assignmentTitle={selectedAssignment?.title || ''}
      />

      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={(o) => setIsRenameOpen(o)}
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
    </div>
  );
};

export default AssignmentTable;
