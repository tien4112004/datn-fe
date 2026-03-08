import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Presentation } from '../../types/presentation';
import { usePresentationManager } from '../../hooks/usePresentationManager';
import { useUpdatePresentationChapter } from '../../hooks/useApi';
import DataTable from '@/components/table/DataTable';
import ActionButton, { ActionContent } from './ActionButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DocumentFilters } from '@/features/projects/components/DocumentFilters';
import { ThumbnailWrapperV2 } from '../others/ThumbnailWrapper';
import { RenameFileDialog } from '@/components/modals/RenameFileDialog';
import { DeleteConfirmationDialog } from '@/shared/components/modals/DeleteConfirmationDialog';
import EditChapterDialog from '@/features/projects/components/EditChapterDialog';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { formatDistance } from 'date-fns';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';

const PresentationTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
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
        meta: {
          isGrow: true,
        },
        enableSorting: true,
      }),
      columnHelper.accessor('grade', {
        header: t('presentation.grade'),
        cell: (info) => info.getValue() ?? '---',
        size: 80,
        enableSorting: false,
      }),
      columnHelper.accessor('subject', {
        header: t('presentation.subject'),
        cell: (info) => info.getValue() ?? '---',
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
    () => ({
      thumbnail: 150,
      title: 400,
      grade: 80,
      subject: 110,
      updatedAt: 150,
      actions: 50,
    }),
    []
  );

  const {
    data,
    isLoading,
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

  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const updatePresentationChapter = useUpdatePresentationChapter();

  const table = useReactTable({
    data: [...data],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    initialState: {
      columnSizing: initialColumnSizing,
    },
    state: {
      sorting,
      pagination,
    },
    rowCount: totalItems,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  return (
    <div className="w-full space-y-4">
      <DocumentFilters
        filters={documentFilters}
        onChange={setDocumentFilters}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('presentation.searchPlaceholder')}
        RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
      />
      <DataTable
        className="w-full"
        table={table}
        isLoading={isLoading}
        onClickRow={(row) => {
          navigate(`/presentation/${row.original.id}`, { replace: false });
        }}
        rowStyle="transition cursor-pointer"
        emptyState={<div className="text-muted-foreground">{t('presentation.emptyState')}</div>}
        contextMenu={(row) => (
          <ActionContent
            onViewDetail={() => {
              navigate(`/presentation/${row.original.id}`, { replace: false });
            }}
            onDelete={() => {
              handleDelete(row.original);
            }}
            onRename={() => {
              handleRename(row.original);
            }}
            onEditChapter={() => {
              setSelectedPresentation(row.original);
              setIsEditChapterOpen(true);
            }}
          />
        )}
      />
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
    </div>
  );
};

export default PresentationTable;
