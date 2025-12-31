import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useQuestionBankList,
  useDeleteQuestions,
  useDuplicateQuestion,
  useCopyToPersonal,
  useExportQuestions,
} from '@/features/assignment/hooks/useQuestionBankApi';
import useQuestionBankStore from '@/features/assignment/stores/questionBankStore';
import type { QuestionBankItem } from '@/features/assignment/types';
import { BANK_TYPE } from '@/features/assignment/types';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Plus, Upload, Download, Search, MoreVertical, Trash2, Copy, FileEdit } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import {
  QuestionBankFormDialog,
  QuestionBankImportDialog,
  CopyToPersonalDialog,
  QuestionContentPreview,
} from '@/features/assignment/components/question-bank';

export function TeacherQuestionBankPage() {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'teacherQuestionBank' });
  const { t: tCommon } = useTranslation(I18N_NAMESPACES.ASSIGNMENT);

  // State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [copyingQuestion, setCopyingQuestion] = useState<QuestionBankItem | null>(null);

  // Store
  const { filters } = useQuestionBankStore();

  // Hooks
  const { data, isLoading } = useQuestionBankList({
    page,
    limit: pageSize,
    ...filters,
    searchText: searchQuery, // Override any searchText from filters
  });

  const deleteQuestionsMutation = useDeleteQuestions();
  const duplicateMutation = useDuplicateQuestion();
  const copyToPersonalMutation = useCopyToPersonal();
  const exportMutation = useExportQuestions();

  const questions = data?.questions || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Permission helpers
  const canEdit = (q: QuestionBankItem) => q.bankType === BANK_TYPE.PERSONAL;
  const canDelete = (q: QuestionBankItem) => q.bankType === BANK_TYPE.PERSONAL;

  // Localization helpers
  const getDifficultyLabel = (difficulty: string) => {
    const difficultyMap: Record<string, string> = {
      nhan_biet: tCommon('difficulty.nhanBiet'),
      thong_hieu: tCommon('difficulty.thongHieu'),
      van_dung: tCommon('difficulty.vanDung'),
      van_dung_cao: tCommon('difficulty.vanDungCao'),
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const getSubjectLabel = (subjectCode: string) => {
    // Map subject codes (T, TV, TA) to i18n keys
    const subjectMap: Record<string, string> = {
      T: tCommon('questionBank.subjects.toan'),
      TV: tCommon('questionBank.subjects.tiengViet'),
      TA: tCommon('questionBank.subjects.tiengAnh'),
    };
    return subjectMap[subjectCode] || subjectCode;
  };

  const getQuestionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      multiple_choice: tCommon('questionTypes.multipleChoice'),
      matching: tCommon('questionTypes.matching'),
      open_ended: tCommon('questionTypes.openEnded'),
      fill_in_blank: tCommon('questionTypes.fillInBlank'),
    };
    return typeMap[type] || type;
  };

  // Handlers
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const personalQuestions = questions.filter((q) => q.bankType === BANK_TYPE.PERSONAL).map((q) => q.id);
      setSelectedQuestions(personalQuestions);
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

    if (!confirm(t('dialogs.delete.description', { count: selectedQuestions.length }))) {
      return;
    }

    try {
      await deleteQuestionsMutation.mutateAsync(selectedQuestions);
      setSelectedQuestions([]);
      toast.success(t('toast.deleteSuccess'));
    } catch (error) {
      toast.error(t('toast.deleteError'));
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
      toast.success(t('toast.duplicateSuccess'));
    } catch (error) {
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
    } catch (error) {
      toast.error(t('toast.copyError'));
    }
  };

  const handleEdit = (question: QuestionBankItem) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
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
    } catch (error) {
      toast.error(t('toast.exportError'));
    }
  };

  return (
    <div className="flex flex-col gap-6 px-8 py-4">
      {/* Header */}
      <div>
        <h1 className="scroll-m-20 text-balance text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>

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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Actions */}
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

              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('actions.create')}
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
                disabled={deleteQuestionsMutation.isPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('actions.deleteSelected')}
              </Button>
            </div>
          )}

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedQuestions.length > 0 &&
                      selectedQuestions.length ===
                        questions.filter((q) => q.bankType === BANK_TYPE.PERSONAL).length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('table.columns.title')}</TableHead>
                <TableHead className="w-48">{t('table.columns.content')}</TableHead>
                <TableHead className="w-32">{t('table.columns.questionType')}</TableHead>
                <TableHead className="w-24">{t('table.columns.subject')}</TableHead>
                <TableHead className="w-32">{t('table.columns.difficulty')}</TableHead>
                <TableHead className="w-20">{t('table.columns.points')}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground text-center">
                    {t('table.loading')}
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground text-center">
                    {t('table.noQuestions')}
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow
                    key={question.id}
                    className={cn(question.bankType === BANK_TYPE.APPLICATION && 'bg-accent/5')}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        disabled={!canDelete(question)}
                        onCheckedChange={(checked) => handleSelectQuestion(question.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="max-w-md truncate font-medium">{question.title}</TableCell>
                    <TableCell>
                      <QuestionContentPreview question={question} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getSubjectLabel(question.subjectCode)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getDifficultyLabel(question.difficulty)}</Badge>
                    </TableCell>
                    <TableCell>{question.points || 10}</TableCell>
                    <TableCell>
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
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(question.id)}
                              >
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
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
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
  );
}
