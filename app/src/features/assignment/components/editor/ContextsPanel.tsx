import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
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
import type { Context } from '@/features/context';
import { ContextListDisplay } from '../context/ContextListDisplay';
import { ContextLibraryDialog } from './ContextLibraryDialog';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';

export const ContextsPanel = () => {
  const { t } = useTranslation('assignment', {
    keyPrefix: 'assignmentEditor.contextsPanel',
  });

  const contexts = useAssignmentFormStore((state) => state.contexts);
  const questions = useAssignmentFormStore((state) => state.questions);
  const addContext = useAssignmentFormStore((state) => state.addContext);
  const updateContext = useAssignmentFormStore((state) => state.updateContext);
  const removeContext = useAssignmentFormStore((state) => state.removeContext);

  // UI state from editor store (triggered by sidebar buttons)
  const showCreateForm = useAssignmentEditorStore((state) => state.isContextCreateFormOpen);
  const setShowCreateForm = useAssignmentEditorStore((state) => state.setContextCreateFormOpen);
  const showLibraryDialog = useAssignmentEditorStore((state) => state.isContextLibraryDialogOpen);
  const setShowLibraryDialog = useAssignmentEditorStore((state) => state.setContextLibraryDialogOpen);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Track which library context titles are already in the assignment (by title match)
  const existingTitles = useMemo(() => new Set(contexts.map((c) => c.title.toLowerCase())), [contexts]);

  const getReferencingQuestionCount = (contextId: string) =>
    questions.filter((q) => q.question.contextId === contextId).length;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removeContext(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleImportFromLibrary = useCallback(
    (importedContexts: Context[]) => {
      importedContexts.forEach((ctx) => {
        addContext({
          title: ctx.title,
          content: ctx.content,
          author: ctx.author,
        });
      });
    },
    [addContext]
  );

  // Also close create form when creating
  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addContext({ title: newTitle.trim(), content: newContent, author: newAuthor.trim() || undefined });
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setShowCreateForm(false);
  };

  const handleCancelCreate = () => {
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('panelTitle')}</h2>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">{t('description')}</p>

      {/* Create Form */}
      {showCreateForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('titleField')}</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('titleField')}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('contentField')}</label>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={t('contentField')}
              className="min-h-[120px] resize-y"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('authorField')}</label>
            <Input
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder={t('authorField')}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleCreate} disabled={!newTitle.trim()}>
              {t('create')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={handleCancelCreate}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Context List */}
      {(contexts.length > 0 || !showCreateForm) && (
        <ContextListDisplay
          contexts={contexts}
          questions={questions}
          onUpdate={updateContext}
          onDelete={(ctx) => setDeleteTarget(ctx)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && t('deleteConfirmDescription', { title: deleteTarget.title })}
            </AlertDialogDescription>
            {deleteTarget && getReferencingQuestionCount(deleteTarget.id) > 0 && (
              <div className="mt-2 flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {t('deleteConfirmWarning', { count: getReferencingQuestionCount(deleteTarget.id) })}
                </span>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Library Import Dialog */}
      <ContextLibraryDialog
        open={showLibraryDialog}
        onOpenChange={setShowLibraryDialog}
        existingTitles={existingTitles}
        onImport={handleImportFromLibrary}
      />
    </div>
  );
};
