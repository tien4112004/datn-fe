import { useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '@/components/table/DataTable';
import { DocumentFilters } from '@/features/projects/components/DocumentFilters';
import {
  useMindmaps,
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
import { BrainCircuit } from 'lucide-react';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { Badge } from '@ui/badge';
import { getSubjectName, getGradeName, getSubjectBadgeClass } from '@aiprimary/core';
import ViewToggle, { type ViewMode } from '@/features/presentation/components/others/ViewToggle';

const columnHelper = createColumnHelper<Mindmap>();

const MindmapTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table' });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [selectedMindmap, setSelectedMindmap] = useState<Mindmap | null>(null);

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', mode);
      return newParams;
    });
  };

  // Use the new hook
  const {
    data,
    isLoading,
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
          // Fallback to icon
          return (
            <div className="bg-muted/50 flex aspect-video w-[160px] items-center justify-center rounded border">
              <BrainCircuit className="text-muted-foreground h-8 w-8" />
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

  // Clone data to ensure fresh references for table
  const tableData = useMemo(() => (data ? data.map((d) => ({ ...d })) : []), [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: {
      sorting,
      pagination,
    },
    rowCount: totalItems,
    onSortingChange: setSorting as any as (updaterOrValue: Updater<SortingState>) => void,
    onPaginationChange: setPagination as any as (updaterOrValue: Updater<PaginationState>) => void,
  });

  // Ensure table uses latest data by updating options when data changes
  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      data: data ? data.map((d) => ({ ...d })) : [],
    }));
  }, [data, table]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleRename = async (id: string, newName: string) => {
    try {
      await updateMindmapTitleMutation.mutateAsync({ id, name: newName });
      setSelectedMindmap((prev) => (prev ? { ...prev, title: newName } : prev));
      toast.success(
        t('mindmap.renameSuccess', {
          filename: newName,
        })
      ); // TODO: move to hook, set i18n
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

  return (
    <div className="w-full space-y-4">
      <DocumentFilters
        filters={documentFilters}
        onChange={setDocumentFilters}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('mindmap.searchPlaceholder')}
        RightComponent={<ViewToggle value={viewMode} onValueChange={setViewMode} />}
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        onClickRow={(row) => {
          navigate(`/mindmap/${row.original.id}`, { replace: false });
        }}
        rowStyle="transition cursor-pointer"
        emptyState={<div className="text-muted-foreground">{t('mindmap.emptyState')}</div>}
        contextMenu={(row) => (
          <ActionContent
            onViewDetail={() => {
              navigate(`/mindmap/${row.original.id}`);
            }}
            onDelete={() => {
              handleDelete(row.original);
            }}
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

      <RenameFileDialog
        isOpen={isRenameOpen}
        onOpenChange={(o) => setIsRenameOpen(o)}
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
    </div>
  );
};

export default MindmapTable;
