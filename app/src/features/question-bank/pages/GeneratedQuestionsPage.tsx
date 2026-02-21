import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import ReactMarkdown from 'react-markdown';
import { useDeleteQuestions } from '../hooks/useQuestionBankApi';
import type { QuestionBankItem } from '../types';
import { Button } from '@ui/button';
import { Checkbox } from '@ui/checkbox';
import { Badge } from '@ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Trash2, FileEdit, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import DataTable from '@/shared/components/table/DataTable';
import { getSubjectName, getQuestionTypeName, getDifficultyName, getGradeName } from '@aiprimary/core';

const columnHelper = createColumnHelper<QuestionBankItem>();

// Helper functions for colorful badges (same as TeacherQuestionBankPage)
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

interface GeneratedQuestionsState {
  questions: QuestionBankItem[];
  totalGenerated: number;
  generationParams?: {
    prompt: string;
    grade: string;
    subject: string;
    chapter?: string;
  };
}

export function GeneratedQuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'generatedQuestions' });
  const { t: tTable } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'teacherQuestionBank.table',
  });

  // Get data from location state
  const locationState = location.state as GeneratedQuestionsState | null;
  const { questions: initialQuestions, generationParams } = locationState || {};

  // Local state to track questions (allows deletion without refetching)
  const [questions, setQuestions] = useState<QuestionBankItem[]>(initialQuestions || []);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Redirect if no questions (e.g., page refresh)
  useEffect(() => {
    if (!initialQuestions || initialQuestions.length === 0) {
      navigate('/question-bank', { replace: true });
    }
  }, [initialQuestions, navigate]);

  const deleteQuestionsMutation = useDeleteQuestions();

  // Get selected question IDs
  const selectedQuestionIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((index) => questions[parseInt(index)]?.id)
    .filter(Boolean);

  // Handlers
  const handleEdit = (question: QuestionBankItem) => {
    navigate(`/question-bank/edit/${question.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dialogs.delete.description', { count: 1 }))) {
      return;
    }

    try {
      await deleteQuestionsMutation.mutateAsync([id]);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success(t('toast.deleteSuccess'));
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestionIds.length === 0) return;

    if (!confirm(t('dialogs.delete.description', { count: selectedQuestionIds.length }))) {
      return;
    }

    try {
      await deleteQuestionsMutation.mutateAsync(selectedQuestionIds);
      setQuestions((prev) => prev.filter((q) => !selectedQuestionIds.includes(q.id)));
      setRowSelection({});
      toast.success(t('toast.deleteSuccess'));
    } catch {
      toast.error(t('toast.deleteError'));
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
            aria-label="Select row"
          />
        ),
        size: 50,
        enableResizing: false,
      }),
      columnHelper.accessor('title', {
        header: tTable('columns.title'),
        cell: (info) => (
          <div className="max-w-md truncate font-medium">
            <ReactMarkdown>{info.getValue()}</ReactMarkdown>
          </div>
        ),
        minSize: 200,
        meta: {
          isGrow: true,
        },
      }),
      columnHelper.accessor('type', {
        header: tTable('columns.questionType'),
        cell: (info) => (
          <Badge variant="outline" className={getQuestionTypeBadgeClass(info.getValue())}>
            {getQuestionTypeName(info.getValue())}
          </Badge>
        ),
        size: 150,
      }),
      columnHelper.accessor('subject', {
        header: tTable('columns.subject'),
        cell: (info) => (
          <Badge variant="outline" className={getSubjectBadgeClass(info.getValue())}>
            {getSubjectName(info.getValue())}
          </Badge>
        ),
        size: 120,
      }),
      columnHelper.accessor('grade', {
        header: tTable('columns.grade'),
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
        header: tTable('columns.difficulty'),
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
                <DropdownMenuItem onClick={() => handleEdit(question)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  {t('actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(question.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 60,
        enableResizing: false,
      }),
    ],
    [t, tTable]
  );

  // Table configuration
  const table = useReactTable({
    data: questions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });

  // Don't render if no questions (will redirect)
  if (!initialQuestions || initialQuestions.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
        {/* Header */}
        <div className="mb-8 space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Sparkles className="h-7 w-7 text-violet-500" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        {/* Summary Card */}
        <div className="rounded-lg border bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:from-violet-950/30 dark:to-purple-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">{t('summary', { count: questions.length })}</p>
              {generationParams && (
                <p className="text-muted-foreground text-sm">
                  {t('promptLabel')}: "{generationParams.prompt}"
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/question-bank')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('backToQuestionBank')}
              </Button>
              <Button
                onClick={() => navigate('/question-bank')}
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600"
              >
                <Sparkles className="h-4 w-4" />
                {t('generateMore')}
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedQuestionIds.length > 0 && (
          <div className="bg-muted flex items-center justify-between rounded-md p-3">
            <span className="text-sm font-medium">
              {t('selectedCount', { count: selectedQuestionIds.length })}
            </span>
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

        {/* Questions Table */}
        <DataTable
          table={table}
          isLoading={false}
          emptyState={<div className="text-muted-foreground py-8 text-center">{t('noQuestions')}</div>}
        />
      </div>
    </div>
  );
}
