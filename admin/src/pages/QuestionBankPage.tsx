import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useQuestionBank,
  useBulkDeleteQuestionBankItems,
  useDuplicateQuestionBankItem,
} from '@/hooks/useApi';
import type { QuestionBankItem, QuestionBankParams } from '@/types/questionBank';
import { QuestionBankFilters } from '@/components/question-bank/QuestionBankFilters';
import { QuestionBankImportDialog } from '@/components/question-bank/QuestionBankImportDialog';
import { QuestionBankExportDialog } from '@/components/question-bank/QuestionBankExportDialog';
import { Button } from '@ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { Checkbox } from '@ui/checkbox';
import { Badge } from '@ui/badge';
import { Plus, Upload, Download, MoreVertical, Trash2, Copy, FileEdit } from 'lucide-react';
import { getSubjectName, getQuestionTypeName, getDifficultyName } from '@aiprimary/core';
import { toast } from 'sonner';

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

export function QuestionBankPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('admin', { keyPrefix: 'questionBank' });

  // State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuestionBankParams>({});
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Hooks
  const { data, isLoading } = useQuestionBank({
    page,
    pageSize,
    searchText: searchQuery,
    sortBy,
    sortDirection,
    ...filters,
  });
  const bulkDeleteMutation = useBulkDeleteQuestionBankItems();
  const duplicateMutation = useDuplicateQuestionBankItem();

  // Handlers
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true && data?.data) {
      setSelectedQuestions(data.data.map((q) => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, id]);
    } else {
      setSelectedQuestions(selectedQuestions.filter((qId) => qId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;

    if (!confirm(t('confirm.bulkDelete', { count: selectedQuestions.length }))) {
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync(selectedQuestions);
      setSelectedQuestions([]);
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

  const handleEdit = (question: QuestionBankItem) => {
    navigate(`/question-bank/edit/${question.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm.delete'))) {
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync([id]);
      toast.success(t('toast.deleteSuccess'));
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      // Toggle direction, then clear
      if (sortDirection === 'ASC') {
        setSortDirection('DESC');
      } else {
        // Clear sorting
        setSortBy(undefined);
        setSortDirection('DESC');
      }
    } else {
      setSortBy(key);
      setSortDirection('ASC');
    }
    setPage(1);
  };

  const getSortState = (key: string): 'asc' | 'desc' | false => {
    if (sortBy !== key) return false;
    return sortDirection === 'ASC' ? 'asc' : 'desc';
  };

  const questions = data?.data || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  // Questions to show in export dialog: selected or all loaded
  const selectedQuestionItems = questions.filter((q) => selectedQuestions.includes(q.id));
  const exportQuestions = selectedQuestionItems.length > 0 ? selectedQuestionItems : questions;

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
        {/* Header */}
        <div className="mb-8 space-y-1">
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        {/* Filters with Search Bar and Actions */}
        <QuestionBankFilters
          filters={filters}
          onChange={setFilters}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          orientation="horizontal"
          RightComponent={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
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
          {selectedQuestions.length > 0 && (
            <div className="bg-muted flex items-center justify-between rounded-md p-3">
              <span className="text-sm font-medium">
                {t('selectedCount', { count: selectedQuestions.length })}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('actions.export')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('actions.deleteSelected')}
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedQuestions.length === questions.length && questions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{t('table.columns.title')}</TableHead>
                  <TableHead sortable sortKey="type" onSort={handleSort} isSorting={getSortState('type')}>
                    {t('table.columns.type')}
                  </TableHead>
                  <TableHead
                    sortable
                    sortKey="subject"
                    onSort={handleSort}
                    isSorting={getSortState('subject')}
                  >
                    {t('table.columns.subject')}
                  </TableHead>
                  <TableHead
                    sortable
                    sortKey="difficulty"
                    onSort={handleSort}
                    isSorting={getSortState('difficulty')}
                  >
                    {t('table.columns.difficulty')}
                  </TableHead>
                  <TableHead>{t('table.columns.created')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center">
                      {t('table.loading')}
                    </TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center">
                      {t('table.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={(checked) => handleSelectQuestion(question.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="max-w-md truncate font-medium">
                        {question.title || (
                          <span className="text-muted-foreground italic">{t('table.noTitle')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getQuestionTypeBadgeClass(question.type)}>
                          {getQuestionTypeName(question.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getSubjectBadgeClass(question.subject)}>
                          {getSubjectName(question.subject)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDifficultyBadgeClass(question.difficulty)}>
                          {getDifficultyName(question.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
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
                            <DropdownMenuItem onClick={() => handleDuplicate(question.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              {t('actions.duplicate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(question.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                {t('pagination.showing', {
                  from: (page - 1) * pageSize + 1,
                  to: Math.min(page * pageSize, totalItems),
                  total: totalItems,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  {t('pagination.previous')}
                </Button>
                <span className="text-sm">{t('pagination.page', { current: page, total: totalPages })}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dialogs */}
        <QuestionBankExportDialog
          open={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          questions={exportQuestions}
        />
        <QuestionBankImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
      </div>
    </div>
  );
}
