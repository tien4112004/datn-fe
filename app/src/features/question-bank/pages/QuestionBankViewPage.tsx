import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Badge } from '@ui/badge';
import { Separator } from '@ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@ui/alert-dialog';
import { useDeleteQuestions, useDuplicateQuestion } from '../hooks/useQuestionBankApi';
import { useContext } from '@/features/context';
import { MarkdownPreview } from '@aiprimary/question/shared';
import { QuestionRenderer } from '@/features/question';
import { VIEW_MODE } from '@aiprimary/core';
import type { QuestionBankItem } from '../types';
import type { Question } from '@aiprimary/core';
import {
  getSubjectName,
  getQuestionTypeName,
  getDifficultyName,
  getGradeName,
  getSubjectBadgeClass,
  getDifficultyBadgeClass,
  getQuestionTypeBadgeClass,
} from '@aiprimary/core';
import { Edit3, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function QuestionBankViewPage() {
  const { t } = useTranslation('assignment', { keyPrefix: 'questionBankView' });
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { question } = useLoaderData() as { question: QuestionBankItem | null };

  if (!question) {
    throw new CriticalError('Question data is unavailable', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const { data: contextData } = useContext(question.contextId);
  const deleteQuestionsMutation = useDeleteQuestions();
  const duplicateMutation = useDuplicateQuestion();

  const handleEdit = () => {
    navigate(`/question-bank/edit/${question.id}`);
  };

  const handleDuplicate = async () => {
    try {
      const newQuestion = await duplicateMutation.mutateAsync(question.id);
      toast.success(t('toast.duplicateSuccess'));
      navigate(`/question-bank/edit/${newQuestion.id}`);
    } catch {
      toast.error(t('toast.duplicateError'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuestionsMutation.mutateAsync([question.id]);
      toast.success(t('toast.deleteSuccess'));
      navigate('/question-bank');
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">{t('pageTitle')}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleEdit} className="gap-2">
                <Edit3 className="h-4 w-4" />
                {t('actions.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={handleDuplicate}
                disabled={duplicateMutation.isPending}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {t('actions.duplicate')}
              </Button>
              <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('actions.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('deleteDialog.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('sections.metadata')}</h3>
            <Separator />

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('fields.subject')}</Label>
                <div>
                  <Badge variant="outline" className={getSubjectBadgeClass(question.subject)}>
                    {getSubjectName(question.subject)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('fields.difficulty')}</Label>
                <div>
                  <Badge variant="outline" className={getDifficultyBadgeClass(question.difficulty)}>
                    {getDifficultyName(question.difficulty)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('fields.grade')}</Label>
                <div>
                  {question.grade ? (
                    <Badge variant="outline">{getGradeName(question.grade)}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('fields.chapter')}</Label>
                <div>
                  {question.chapter ? (
                    <Badge variant="outline">{question.chapter}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('fields.type')}</Label>
                <div>
                  <Badge variant="outline" className={getQuestionTypeBadgeClass(question.type)}>
                    {getQuestionTypeName(question.type)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Context Section */}
          {contextData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('sections.context')}</h3>
              <Separator />
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="space-y-3">
                  {contextData.title && (
                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {contextData.title}
                    </h4>
                  )}
                  <MarkdownPreview
                    content={contextData.content}
                    className="text-sm text-gray-700 dark:text-gray-300"
                  />
                  {contextData.author && (
                    <p className="text-right text-xs italic text-gray-600 dark:text-gray-400">
                      — {contextData.author}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Question Content Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('sections.content')}</h3>
            <Separator />

            <QuestionRenderer question={question as Question} viewMode={VIEW_MODE.VIEWING} />
          </div>

          {/* Explanation Section */}
          {question.explanation && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('sections.explanation')}</h3>
              <Separator />
              <MarkdownPreview content={question.explanation} />
            </div>
          )}

          {/* Timestamps */}
          {(question.createdAt || question.updatedAt) && (
            <div className="text-muted-foreground space-y-1 text-xs">
              {question.createdAt && (
                <p>
                  {t('fields.createdAt')}: {new Date(question.createdAt).toLocaleString()}
                </p>
              )}
              {question.updatedAt && (
                <p>
                  {t('fields.updatedAt')}: {new Date(question.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
