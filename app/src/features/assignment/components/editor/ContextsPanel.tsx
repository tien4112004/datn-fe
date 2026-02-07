import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Trash2, AlertTriangle, Check } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { useContextList } from '@/features/context';
import { EditableContextDisplay } from '../context/EditableContextDisplay';
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

  // Library import dialog state
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());

  // Fetch library contexts when dialog is open
  const { data: libraryData, isLoading: isLoadingLibrary } = useContextList(
    showLibraryDialog ? { search: librarySearch || undefined, pageSize: 20 } : { pageSize: 0 }
  );
  const libraryContexts = libraryData?.contexts || [];

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

  const toggleLibrarySelection = (id: string) => {
    setSelectedLibraryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleImportSelected = () => {
    const toImport = libraryContexts.filter((ctx) => selectedLibraryIds.has(ctx.id));
    toImport.forEach((ctx) => {
      addContext({
        title: ctx.title,
        content: ctx.content,
        author: ctx.author,
      });
    });
    setSelectedLibraryIds(new Set());
    setLibrarySearch('');
    setShowLibraryDialog(false);
  };

  const handleCloseLibraryDialog = () => {
    setSelectedLibraryIds(new Set());
    setLibrarySearch('');
    setShowLibraryDialog(false);
  };

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
      {contexts.length === 0 && !showCreateForm ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contexts.map((context) => {
            const refCount = getReferencingQuestionCount(context.id);
            return (
              <div key={context.id} className="relative">
                <EditableContextDisplay
                  context={context}
                  onUpdate={(updates) => updateContext(context.id, updates)}
                />
                <div className="absolute right-0 top-2 flex items-center gap-2">
                  {refCount > 0 && <span className="text-xs text-gray-400">{refCount} Q</span>}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    onClick={() => setDeleteTarget({ id: context.id, title: context.title })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
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
      <Dialog open={showLibraryDialog} onOpenChange={(open) => !open && handleCloseLibraryDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('fromLibraryTitle')}</DialogTitle>
            <DialogDescription>{t('fromLibraryDescription')}</DialogDescription>
          </DialogHeader>

          <Input
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            placeholder={t('searchLibrary')}
          />

          <div className="max-h-[400px] overflow-y-auto">
            {isLoadingLibrary ? (
              <div className="py-8 text-center text-sm text-gray-500">{t('loadingLibrary')}</div>
            ) : libraryContexts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">{t('noLibraryContextFound')}</div>
            ) : (
              <div className="space-y-1">
                {libraryContexts.map((ctx) => {
                  const alreadyExists = existingTitles.has(ctx.title.toLowerCase());
                  const isSelected = selectedLibraryIds.has(ctx.id);

                  return (
                    <button
                      key={ctx.id}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => toggleLibrarySelection(ctx.id)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-colors',
                        alreadyExists
                          ? 'cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{ctx.title}</span>
                          {alreadyExists && (
                            <span className="shrink-0 text-xs text-gray-400">{t('alreadyAdded')}</span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                          {ctx.content.substring(0, 120)}
                          {ctx.content.length > 120 ? '...' : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={handleCloseLibraryDialog}>
              {t('cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleImportSelected}
              disabled={selectedLibraryIds.size === 0}
            >
              {t('importSelected', { count: selectedLibraryIds.size })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
