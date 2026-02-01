import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQuestionBank,
  useBulkDeleteQuestionBankItems,
  useDuplicateQuestionBankItem,
  useExportQuestionBank,
} from '@/hooks/useApi';
import type { QuestionBankItem, QuestionBankParams } from '@/types/questionBank';
import { QuestionBankFilters } from '@/components/question-bank/QuestionBankFilters';
import { QuestionBankImportDialog } from '@/components/question-bank/QuestionBankImportDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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

  // State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuestionBankParams>({});
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Hooks
  const { data, isLoading } = useQuestionBank({ page, pageSize, searchText: searchQuery, ...filters });
  const bulkDeleteMutation = useBulkDeleteQuestionBankItems();
  const duplicateMutation = useDuplicateQuestionBankItem();
  const exportMutation = useExportQuestionBank();

  // Handlers
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
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

    if (!confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)?`)) {
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync(selectedQuestions);
      setSelectedQuestions([]);
      toast.success('Questions deleted successfully');
    } catch {
      toast.error('Failed to delete questions');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
      toast.success('Question duplicated successfully');
    } catch {
      toast.error('Failed to duplicate question');
    }
  };

  const handleEdit = (question: QuestionBankItem) => {
    navigate(`/question-bank/edit/${question.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync([id]);
      toast.success('Question deleted successfully');
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(filters);
      toast.success('Export started');
    } catch {
      toast.error('Failed to export questions');
    }
  };

  const questions = data?.data || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
        {/* Header */}
        <div className="mb-8 space-y-1">
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">Application Question Bank</h1>
          <p className="text-muted-foreground text-sm">Manage shared questions for all teachers</p>
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>

              <Button size="sm" onClick={() => navigate('/question-bank/create')} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Question
              </Button>
            </div>
          }
        />

        {/* Action Bar */}
        <div className="space-y-4">
          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <div className="bg-muted flex items-center justify-between rounded-md p-3">
              <span className="text-sm font-medium">{selectedQuestions.length} question(s) selected</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center">
                      Loading questions...
                    </TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground text-center">
                      No questions found. Create your first question to get started.
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
                        {question.title || <span className="text-muted-foreground italic">No title</span>}
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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(question.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(question.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems}{' '}
                questions
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dialogs */}
        <QuestionBankImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
      </div>
    </div>
  );
}
