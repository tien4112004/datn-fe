import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronDown, ChevronUp, Pencil, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { MarkdownPreview } from '@/features/question/components/shared/MarkdownPreview';
import type { AssignmentContext } from '../../types';

interface EditableContextDisplayProps {
  context: AssignmentContext;
  onUpdate: (updates: Partial<AssignmentContext>) => void;
  defaultCollapsed?: boolean;
  readOnly?: boolean;
}

export const EditableContextDisplay = ({
  context,
  onUpdate,
  defaultCollapsed = false,
  readOnly = false,
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
    <Card className="mb-4 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
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
                <CardTitle className="truncate text-base text-blue-900 dark:text-blue-100">
                  {context.title || t('readingPassage')}
                </CardTitle>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  <span className="sr-only">{isEditing ? t('preview') : t('edit')}</span>
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
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-2">
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
              </div>
            ) : (
              <div className="space-y-4">
                <MarkdownPreview content={context.content} className="text-gray-800 dark:text-gray-200" />
                {context.author && (
                  <p className="text-muted-foreground text-right text-sm italic">— {context.author}</p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
