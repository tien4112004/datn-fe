import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDeleteQuestions, useUpdateQuestion } from '../hooks/useQuestionBankApi';
import type { QuestionBankItem } from '../types';
import type { Question } from '@aiprimary/core';
import { getSubjectName, getGradeName } from '@aiprimary/core';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Checkbox } from '@ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Trash2, FileEdit, Sparkles, FileText, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { GeneratedQuestionsResultList } from '@aiprimary/question/shared';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { VIEW_MODE } from '@/features/assignment/types';

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

  // Get data from location state
  const locationState = location.state as GeneratedQuestionsState | null;
  const { questions: initialQuestions, generationParams } = locationState || {};

  // Local state
  const [questions, setQuestions] = useState<QuestionBankItem[]>(initialQuestions || []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

  // Redirect if no questions (e.g., page refresh)
  useEffect(() => {
    if (!initialQuestions || initialQuestions.length === 0) {
      navigate('/question-bank', { replace: true });
    }
  }, [initialQuestions, navigate]);

  const deleteQuestionsMutation = useDeleteQuestions();
  const updateQuestionMutation = useUpdateQuestion();

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  // Inline editing handlers
  const startEditing = (question: QuestionBankItem) => {
    setEditingId(question.id);
    setEditingQuestion({ ...question });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingQuestion(null);
  };

  const handleEditChange = (updated: Question) => {
    if (!editingQuestion) return;
    setEditingQuestion({ ...editingQuestion, ...updated });
  };

  const saveEditing = async () => {
    if (!editingQuestion || !editingId) return;

    try {
      await updateQuestionMutation.mutateAsync({
        id: editingId,
        data: { question: editingQuestion },
      });
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? editingQuestion : q)));
      setEditingId(null);
      setEditingQuestion(null);
      toast.success(t('toast.updateSuccess'));
    } catch {
      toast.error(t('toast.updateError'));
    }
  };

  // Delete handlers
  const handleDelete = async (id: string) => {
    if (!confirm(t('dialogs.delete.description', { count: 1 }))) return;

    try {
      await deleteQuestionsMutation.mutateAsync([id]);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (editingId === id) cancelEditing();
      toast.success(t('toast.deleteSuccess'));
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (!confirm(t('dialogs.delete.description', { count: ids.length }))) return;

    try {
      await deleteQuestionsMutation.mutateAsync(ids);
      setQuestions((prev) => prev.filter((q) => !selectedIds.has(q.id)));
      setSelectedIds(new Set());
      if (editingId && selectedIds.has(editingId)) cancelEditing();
      toast.success(t('toast.deleteSuccess'));
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

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
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <p className="text-lg font-medium">{t('summary', { count: questions.length })}</p>
              {generationParams && (
                <>
                  <div className="flex items-start gap-2">
                    <FileText className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm">{generationParams.prompt}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{getGradeName(generationParams.grade)}</Badge>
                    <Badge variant="secondary">{getSubjectName(generationParams.subject)}</Badge>
                    {generationParams.chapter && (
                      <Badge variant="secondary">{generationParams.chapter}</Badge>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-shrink-0 gap-2">
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

        {/* Select All + Bulk Actions */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={
                questions.length > 0 && selectedIds.size === questions.length
                  ? true
                  : selectedIds.size > 0
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={toggleSelectAll}
              aria-label={t('selectAll')}
            />
            <span className="text-muted-foreground text-sm">
              {selectedIds.size > 0 ? t('selectedCount', { count: selectedIds.size }) : t('selectAll')}
            </span>
          </label>
          {selectedIds.size > 0 && (
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
          )}
        </div>

        {/* Questions List - Card based */}
        <GeneratedQuestionsResultList
          questions={questions}
          showMetadata
          renderCardHeader={(question) => ({
            left: (
              <Checkbox
                checked={selectedIds.has(question.id)}
                onCheckedChange={() => toggleSelect(question.id)}
                aria-label={`Select question`}
              />
            ),
            right:
              editingId === question.id ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={cancelEditing} className="h-8 gap-1 text-xs">
                    <X className="h-3.5 w-3.5" />
                    {t('actions.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveEditing}
                    disabled={updateQuestionMutation.isPending}
                    className="h-8 gap-1 text-xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {t('actions.save')}
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditing(question)}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      {t('actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(question.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
          })}
          renderQuestion={(question) => {
            if (editingId === question.id && editingQuestion) {
              return (
                <QuestionRenderer
                  question={editingQuestion as Question}
                  viewMode={VIEW_MODE.EDITING}
                  onChange={handleEditChange}
                />
              );
            }
            return <QuestionRenderer question={question as Question} viewMode={VIEW_MODE.VIEWING} />;
          }}
        />
      </div>
    </div>
  );
}
