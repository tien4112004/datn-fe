import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronDown, ChevronUp, Pencil, Unlink, Info, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/collapsible';
import { MarkdownPreview } from '@aiprimary/question/shared';
import type { AssignmentContext } from '../../types';

interface EditableContextDisplayProps {
  context: AssignmentContext;
  onUpdate: (updates: Partial<AssignmentContext>) => void;
  onRemove?: () => void;
  onDelete?: () => void;
  onNavigate?: () => void;
  refCount?: number;
  defaultCollapsed?: boolean;
  readOnly?: boolean;
  showTitle?: boolean;
}

export const EditableContextDisplay = ({
  context,
  onUpdate,
  onRemove,
  onDelete,
  onNavigate,
  refCount,
  defaultCollapsed = false,
  readOnly = false,
  showTitle = true,
}: EditableContextDisplayProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'context' });
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ author: e.target.value });
  };

  return (
    <div className="mb-4 border-l-4 border-l-blue-400 pl-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between py-2">
          {showTitle && (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <BookOpen className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              {isEditing && !readOnly ? (
                <Input
                  value={context.title}
                  onChange={handleTitleChange}
                  placeholder={t('titlePlaceholder')}
                  className="h-8 flex-1 text-base font-semibold"
                />
              ) : (
                <h3 className="truncate text-base font-semibold text-blue-900 dark:text-blue-100">
                  {context.title || t('readingPassage')}
                </h3>
              )}
            </div>
          )}
          <div className="flex shrink-0 items-center gap-1">
            {refCount !== undefined && refCount > 0 && (
              <span className="text-xs text-gray-400">{refCount} Q</span>
            )}
            {!readOnly && !isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                onClick={() => setIsEditing(true)}
                title={t('edit')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && !readOnly && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-500"
                onClick={onDelete}
                title={t('disconnect')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {onRemove && !readOnly && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-500"
                onClick={onRemove}
                title={t('disconnect')}
              >
                <Unlink className="h-4 w-4" />
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">{isOpen ? t('collapse') : t('expand')}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="py-2">
            {isEditing && !readOnly ? (
              <div className="space-y-4">
                <Textarea
                  value={context.content}
                  onChange={handleContentChange}
                  placeholder={t('contentPlaceholder')}
                  className="min-h-[200px] resize-y"
                />
                <div>
                  <Input
                    value={context.author || ''}
                    onChange={handleAuthorChange}
                    placeholder={t('authorPlaceholder')}
                    className="max-w-xs text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Info className="h-3 w-3 shrink-0" />
                    {t('assignmentOnlyHint')}
                  </p>
                  <Button type="button" size="sm" onClick={() => setIsEditing(false)}>
                    {t('done')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <MarkdownPreview content={context.content} className="text-gray-800 dark:text-gray-200" />
                {context.author && (
                  <p className="text-muted-foreground text-right text-sm italic">— {context.author}</p>
                )}
              </div>
            )}
            {onNavigate && (
              <div className="mt-3 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  onClick={onNavigate}
                >
                  {t('viewQuestions')}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
