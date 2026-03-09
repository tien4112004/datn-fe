import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Assignment } from '../../types';
import {
  useAssignmentList,
  useDeleteAssignment,
  useUpdateAssignmentChapter,
} from '@/features/assignment/hooks/useAssignmentApi';
import { Button } from '@ui/button';
import { MoreHorizontal, ClipboardList } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { DocumentFilters } from '@/features/projects/components/DocumentFilters';
import { useAssignmentListStore } from '@/features/assignment/stores/useAssignmentListStore';
import TablePagination from '@/shared/components/table/TablePagination';
import { ActionContent } from '@/features/presentation/components';
import { ExportAssignmentPdfDialog } from '@/features/assignment/components/export/ExportAssignmentPdfDialog';
import { RenameFileDialog } from '@/shared/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import EditChapterDialog from '@/features/projects/components/EditChapterDialog';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';
import { toast } from 'sonner';

import { formatDistance } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { Badge } from '@ui/badge';
import { getSubjectName, getGradeName, getSubjectBadgeClass } from '@aiprimary/core';

const AssignmentGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const columnHelper = createColumnHelper<Assignment>();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const { search, documentFilters, pagination, setSearch, setDocumentFilters, setPagination } =
    useAssignmentListStore();

  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';

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

  const formatDate = useCallback((date: Date | string | undefined): string => {
    if (!date) return '';
    return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: getLocaleDateFns() });
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: t('assignment.id') }),
      columnHelper.accessor('title', { header: t('assignment.title') }),
    ],
    [columnHelper, t]
  );

  const table = useReactTable({
    data: data || [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableSorting: false,
    state: {
      pagination,
    },
    rowCount: totalItems,
    onPaginationChange: setPagination,
  });

  const handleRename = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsRenameOpen(true);
  };

  const handleConfirmRename = async (_id: string, newName: string) => {
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

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <div className="group w-full cursor-pointer">
      <div
        className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 p-6 transition-shadow duration-200 hover:shadow-md"
        onClick={() => navigate(`/assignment/${assignment.id}`)}
      >
        <ClipboardList className="mb-3 h-12 w-12 text-indigo-500" />
        <div className="text-center">
          <div className="mb-2 font-medium text-gray-700">{assignment.title}</div>
        </div>

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
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
              <ActionContent
                onViewDetail={() => navigate(`/assignment/${assignment.id}`)}
                onDelete={() => handleDelete(assignment)}
                onRename={() => handleRename(assignment)}
                onExport={() => {
                  setSelectedAssignment(assignment);
                  setIsExportOpen(true);
                }}
                onEditChapter={() => {
                  setSelectedAssignment(assignment);
                  setIsEditChapterOpen(true);
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3
          className="cursor-pointer truncate text-sm font-medium text-gray-900 transition-colors hover:text-blue-600"
          onClick={() => navigate(`/assignment/${assignment.id}`)}
        >
          {assignment.title || t('assignment.untitled')}
        </h3>
        <div className="flex items-center gap-1.5">
          {assignment.subject && (
            <Badge
              variant="outline"
              className={`px-1.5 py-0 text-[10px] ${getSubjectBadgeClass(assignment.subject)}`}
            >
              {getSubjectName(assignment.subject)}
            </Badge>
          )}
          {assignment.grade && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              {getGradeName(assignment.grade)}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {t('assignment.lastModified')}: {formatDate(assignment.updatedAt)}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <DocumentFilters
          filters={documentFilters}
          onChange={setDocumentFilters}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('assignment.searchPlaceholder')}
          RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
        />
        <div className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="w-full animate-pulse">
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
      <DocumentFilters
        filters={documentFilters}
        onChange={setDocumentFilters}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('assignment.searchPlaceholder')}
        RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
      />

      {data && data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>

          <TablePagination table={table} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-2 text-lg text-gray-500">{t('assignment.emptyState')}</div>
          <div className="text-sm text-gray-400">{t('assignment.createFirst')}</div>
        </div>
      )}

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
        onRename={handleConfirmRename}
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

export default AssignmentGrid;
