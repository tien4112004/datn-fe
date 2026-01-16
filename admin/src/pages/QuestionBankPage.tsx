import { useState } from 'react';
import {
  useQuestionBank,
  useBulkDeleteQuestionBankItems,
  useDuplicateQuestionBankItem,
  useExportQuestionBank,
} from '@/hooks/useApi';
import type { QuestionBankItem, QuestionBankParams } from '@/types/questionBank';
import { QuestionBankFilters } from '@/components/question-bank/QuestionBankFilters';
import { QuestionBankFormDialog } from '@/components/question-bank/QuestionBankFormDialog';
import { QuestionBankImportDialog } from '@/components/question-bank/QuestionBankImportDialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Download, Search, MoreVertical, Trash2, Copy, FileEdit, Filter } from 'lucide-react';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from '@/types/questionBank';

export function QuestionBankPage() {
  // State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuestionBankParams>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
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
    await bulkDeleteMutation.mutateAsync(selectedQuestions);
    setSelectedQuestions([]);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id);
  };

  const handleEdit = (question: QuestionBankItem) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
  };

  const handleExport = async () => {
    await exportMutation.mutateAsync(filters);
  };

  const questions = data?.data || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  return (
    <div className="flex h-full">
      {/* Sidebar - Filters (Desktop) */}
      <aside className="hidden w-72 flex-shrink-0 border-r md:block">
        <div className="sticky top-0 h-screen overflow-y-auto p-4">
          <h3 className="mb-4 text-lg font-semibold">Filters</h3>
          <QuestionBankFilters filters={filters} onChange={setFilters} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 px-8 py-4">
          {/* Header */}
          <div>
            <h1 className="scroll-m-20 text-balance text-4xl font-bold tracking-tight">
              Application Question Bank
            </h1>
            <p className="text-muted-foreground text-sm">Manage shared questions for all teachers</p>
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 md:hidden">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <QuestionBankFilters filters={filters} onChange={setFilters} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Action Bar */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="relative max-w-md flex-1">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportDialogOpen(true)}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>

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

                  <Button size="sm" onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Question
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Bulk Actions */}
              {selectedQuestions.length > 0 && (
                <div className="bg-muted mb-4 flex items-center justify-between rounded-md p-3">
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
                    <TableHead>Points</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground text-center">
                        Loading questions...
                      </TableCell>
                    </TableRow>
                  ) : questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground text-center">
                        No questions found. Create your first question to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={(checked) =>
                              handleSelectQuestion(question.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="max-w-md truncate font-medium">{question.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{question.subjectCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {DIFFICULTY_LABELS[question.difficulty as keyof typeof DIFFICULTY_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell>{question.points || 10}</TableCell>
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
                                onClick={() => handleBulkDelete()}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of{' '}
                    {totalItems} questions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
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
            </CardContent>
          </Card>

          {/* Dialogs */}
          <QuestionBankFormDialog
            open={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            mode="create"
          />
          <QuestionBankFormDialog
            open={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingQuestion(null);
            }}
            mode="edit"
            question={editingQuestion}
          />
          <QuestionBankImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
        </div>
      </div>
    </div>
  );
}
