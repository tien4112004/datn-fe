import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { QuestionBankDialog } from '../question-bank';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { getContextApiService } from '@/features/context';
import { getUserPreference, setUserPreference } from '@/shared/utils/userPreferences';
import { generateId } from '@/shared/lib/utils';
import type { Question } from '../../types';

/**
 * Self-contained component that manages the QuestionBankDialog
 * and the context import confirmation AlertDialog.
 *
 * Replaces the duplicate QuestionBankDialog that was in both
 * AssignmentEditorPage and CurrentQuestionView.
 */
export const QuestionBankImportManager: React.FC = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });

  const isQuestionBankOpen = useAssignmentEditorStore((state) => state.isQuestionBankOpen);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);

  const [pendingImport, setPendingImport] = React.useState<{
    questions: Question[];
    contextIds: string[];
    contextTitles: string[];
  } | null>(null);
  const [dontAskAgain, setDontAskAgain] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);

  const fetchAndImportWithContexts = async (questions: Question[], contextIds: string[]) => {
    const { addQuestion, addContext, topics, contexts: existingContexts } = useAssignmentFormStore.getState();

    const defaultTopic = topics[0];
    if (!defaultTopic) {
      toast.error(t('toasts.noTopicError'));
      return;
    }

    const contextService = getContextApiService();
    const fetchedContexts = await contextService.getContextsByIds(contextIds);

    const existingTitles = new Map(existingContexts.map((c) => [c.title.toLowerCase(), c.id]));
    const contextIdMap = new Map<string, string>();

    fetchedContexts.forEach((ctx) => {
      const existingId = existingTitles.get(ctx.title.toLowerCase());
      if (existingId) {
        contextIdMap.set(ctx.id, existingId);
      } else {
        const newId = addContext({ title: ctx.title, content: ctx.content, author: ctx.author });
        contextIdMap.set(ctx.id, newId);
      }
    });

    questions.forEach((question) => {
      const libraryContextId = (question as any).contextId as string | undefined;
      const assignmentContextId = libraryContextId ? contextIdMap.get(libraryContextId) : undefined;

      addQuestion({
        question: {
          ...question,
          id: generateId(),
          topicId: defaultTopic.id,
          contextId: assignmentContextId,
        },
        points: 10,
      });
    });

    toast.success(t('toasts.questionsAdded', { count: questions.length }));
  };

  const handleAddQuestionsFromBank = async (questions: Question[]) => {
    const { topics } = useAssignmentFormStore.getState();

    const defaultTopic = topics[0];
    if (!defaultTopic) {
      toast.error(t('toasts.noTopicError'));
      return;
    }

    const contextIds = [
      ...new Set(
        questions.map((q) => (q as any).contextId as string | undefined).filter((id): id is string => !!id)
      ),
    ];

    // No contexts referenced — add questions directly
    if (contextIds.length === 0) {
      const { addQuestion } = useAssignmentFormStore.getState();
      questions.forEach((question) => {
        addQuestion({
          question: { ...question, id: generateId(), topicId: defaultTopic.id },
          points: 10,
        });
      });
      toast.success(t('toasts.questionsAdded', { count: questions.length }));
      return;
    }

    // Check "Don't ask again" preference — auto-import silently
    if (getUserPreference('skipImportContextConfirm')) {
      fetchAndImportWithContexts(questions, contextIds).catch((error) => {
        console.error('Failed to fetch contexts for import:', error);
        toast.error(t('toasts.contextFetchError'));
      });
      return;
    }

    // Show confirmation dialog
    try {
      const contextService = getContextApiService();
      const fetchedContexts = await contextService.getContextsByIds(contextIds);
      const contextTitles = fetchedContexts.map((ctx) => ctx.title);
      setPendingImport({ questions, contextIds, contextTitles });
    } catch {
      setPendingImport({ questions, contextIds, contextTitles: [] });
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingImport) return;

    if (dontAskAgain) {
      setUserPreference('skipImportContextConfirm', true);
    }

    setIsImporting(true);
    try {
      await fetchAndImportWithContexts(pendingImport.questions, pendingImport.contextIds);
    } catch (error) {
      console.error('Failed to fetch contexts for import:', error);
      toast.error(t('toasts.contextFetchError'));
    } finally {
      setIsImporting(false);
      setPendingImport(null);
      setDontAskAgain(false);
    }
  };

  const handleCancelImport = () => {
    setPendingImport(null);
    setDontAskAgain(false);
  };

  return (
    <>
      <QuestionBankDialog
        open={isQuestionBankOpen}
        onOpenChange={setQuestionBankOpen}
        onAddQuestions={handleAddQuestionsFromBank}
      />

      <AlertDialog
        open={!!pendingImport}
        onOpenChange={(open) => !open && !isImporting && handleCancelImport()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('importContextDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('importContextDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          {pendingImport && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t('importContextDialog.passageCount', { count: pendingImport.contextIds.length })}
              </p>
              {pendingImport.contextTitles.length > 0 && (
                <ul className="space-y-1.5">
                  {pendingImport.contextTitles.map((title, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{title}</span>
                    </li>
                  ))}
                </ul>
              )}
              <label className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={dontAskAgain}
                  onCheckedChange={(checked) => setDontAskAgain(checked === true)}
                  disabled={isImporting}
                />
                <span className="text-sm text-gray-500">{t('importContextDialog.dontAskAgain')}</span>
              </label>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>{t('importContextDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport} disabled={isImporting}>
              {t('importContextDialog.import')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
