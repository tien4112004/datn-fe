import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  useQuestionBankList,
  useDeleteQuestions,
  useDuplicateQuestion,
  useCopyToPersonal,
  useExportQuestions,
} from '@/features/assignment/hooks/useQuestionBankApi';
import useQuestionBankStore from '@/features/assignment/stores/questionBankStore';
import type { QuestionBankItem } from '@/features/assignment/types';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Plus, Upload, Download, MoreVertical, Trash2, Copy, FileEdit } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import DataTable from '@/shared/components/table/DataTable';
import {
  QuestionBankImportDialog,
  CopyToPersonalDialog,
  QuestionBankFilters,
} from '@/features/assignment/components/question-bank';
import { getSubjectName, getQuestionTypeName, getDifficultyName, getGradeName } from '@aiprimary/core';

const columnHelper = createColumnHelper<QuestionBankItem>();

// Helper functions for colorful badges
const getSubjectBadgeClass = (subject: string) => {
  switch (subject) {
    case 'T': // Math
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'TV': // Vietnamese
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'TA': // English
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
};

const getDifficultyBadgeClass = (difficulty: string) => {
  switch (difficulty) {
    case 'KNOWLEDGE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'COMPREHENSION':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'APPLICATION':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    case 'ADVANCED_APPLICATION':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
};

const getQuestionTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'MATCHING':
      return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
    case 'FILL_IN_BLANK':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800';
    case 'OPEN_ENDED':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    case 'GROUP':
      return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
};

export function TeacherQuestionBankPage() {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'teacherQuestionBank' });
  const { t: tCommon } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);

  const navigate = useNavigate();

  // State
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copyingQuestion, setCopyingQuestion] = useState<QuestionBankItem | null>(null);

  // Store
  const { filters } = useQuestionBankStore();

  // Hooks
  const { data, isLoading } = useQuestionBankList({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...filters,
  });

  const deleteQuestionsMutation = useDeleteQuestions();
  const duplicateMutation = useDuplicateQuestion();
  const copyToPersonalMutation = useCopyToPersonal();
  const exportMutation = useExportQuestions();

  const questions = data?.questions || [];
  const totalItems = data?.total || 0;

  // Permission helpers
  // Note: Permissions are now managed by API/filters, not item properties
  const canEdit = (_q: QuestionBankItem) => true;
  const canDelete = (_q: QuestionBankItem) => true;

  // Get selected question IDs
  const selectedQuestionIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((index) => questions[parseInt(index)]?.id)
    .filter(Boolean);

  // Handlers
  const handleBulkDelete = async () => {
    if (selectedQuestionIds.length === 0) return;

    if (!confirm(t('dialogs.delete.description', { count: selectedQuestionIds.length }))) {
      return;
    }

    try {
      await deleteQuestionsMutation.mutateAsync(selectedQuestionIds);
      setRowSelection({});
      toast.success(t('toast.deleteSuccess'));
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
      toast.success(t('toast.duplicateSuccess'));
    } catch {
      toast.error(t('toast.duplicateError'));
    }
  };

  const handleCopyToPersonal = (question: QuestionBankItem) => {
    setCopyingQuestion(question);
    setIsCopyDialogOpen(true);
  };

  const handleCopyConfirm = async () => {
    if (!copyingQuestion) return;

    try {
      await copyToPersonalMutation.mutateAsync(copyingQuestion.id);
      toast.success(t('toast.copySuccess'));
      setIsCopyDialogOpen(false);
      setCopyingQuestion(null);
    } catch {
      toast.error(t('toast.copyError'));
    }
  };

  const handleEdit = (question: QuestionBankItem) => {
    navigate(`/question-bank/edit/${question.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dialogs.delete.description', { count: 1 }))) {
      return;
    }

    try {
      await deleteQuestionsMutation.mutateAsync([id]);
      toast.success(t('toast.deleteSuccess'));
    } catch (error) {
      toast.error(t('toast.deleteError'));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teacher-questions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t('toast.exportSuccess'));
    } catch {
      toast.error(t('toast.exportError'));
    }
  };

  // Column definitions
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            disabled={!canDelete(row.original)}
            aria-label="Select row"
          />
        ),
        size: 50,
        enableResizing: false,
      }),
      columnHelper.accessor('title', {
        header: t('table.columns.title'),
        cell: (info) => <span className="max-w-md truncate font-medium">{info.getValue()}</span>,
        minSize: 200,
        meta: {
          isGrow: true,
        },
      }),
      columnHelper.accessor('type', {
        header: t('table.columns.questionType'),
        cell: (info) => (
          <Badge variant="outline" className={getQuestionTypeBadgeClass(info.getValue())}>
            {getQuestionTypeName(info.getValue())}
          </Badge>
        ),
        size: 150,
      }),
      columnHelper.accessor('subject', {
        header: t('table.columns.subject'),
        cell: (info) => (
          <Badge variant="outline" className={getSubjectBadgeClass(info.getValue())}>
            {getSubjectName(info.getValue())}
          </Badge>
        ),
        size: 120,
      }),
      columnHelper.accessor('grade', {
        header: t('table.columns.grade'),
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
      columnHelper.accessor('difficulty', {
        header: t('table.columns.difficulty'),
        cell: (info) => (
          <Badge variant="outline" className={getDifficultyBadgeClass(info.getValue())}>
            {getDifficultyName(info.getValue())}
          </Badge>
        ),
        size: 140,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const question = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit(question) ? (
                  <>
                    <DropdownMenuItem onClick={() => handleEdit(question)}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(question.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(question.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => handleCopyToPersonal(question)}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('actions.copyToPersonal')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 60,
        enableResizing: false,
      }),
    ],
    [t, tCommon]
  );

  // Table configuration
  const table = useReactTable({
    data: questions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableRowSelection: (row) => canDelete(row.original),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: {
      rowSelection,
      pagination,
    },
    rowCount: totalItems,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
  });

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
        {/* Header */}
        <div className="mb-8 space-y-1">
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <QuestionBankFilters
          orientation="horizontal"
          RightComponent={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {t('actions.export')}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {t('actions.import')}
              </Button>

              <Button size="sm" onClick={() => navigate('/question-bank/create')} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('actions.create')}
              </Button>
            </div>
          }
        />

        {/* Action Bar */}
        <div className="space-y-4">
          {/* Bulk Actions */}
          {selectedQuestionIds.length > 0 && (
            <div className="bg-muted flex items-center justify-between rounded-md p-3">
              <span className="text-sm font-medium">{selectedQuestionIds.length} question(s) selected</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteQuestionsMutation.isPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('actions.deleteSelected')}
              </Button>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            table={table}
            isLoading={isLoading}
            emptyState={
              <div className="text-muted-foreground py-8 text-center">{t('table.noQuestions')}</div>
            }
            showPagination={true}
          />
        </div>

        {/* Dialogs */}
        <QuestionBankImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />

        <CopyToPersonalDialog
          open={isCopyDialogOpen}
          onClose={() => {
            setIsCopyDialogOpen(false);
            setCopyingQuestion(null);
          }}
          onConfirm={handleCopyConfirm}
          question={copyingQuestion}
          isLoading={copyToPersonalMutation.isPending}
        />
      </div>
    </div>
  );
}
