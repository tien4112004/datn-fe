import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Button } from '@ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/collapsible';
import { MarkdownPreview } from '@/features/question/components/shared/MarkdownPreview';
import type { Context } from '../types';

interface ContextDisplayProps {
  context: Context;
  defaultCollapsed?: boolean;
  showQuestionNumbers?: boolean;
  questionNumbers?: number[];
}

export const ContextDisplay = ({
  context,
  defaultCollapsed = false,
  showQuestionNumbers = false,
  questionNumbers = [],
}: ContextDisplayProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'context' });
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  return (
    <div className="border-l-4 border-l-blue-400 pl-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">
              {context.title || t('readingPassage')}
            </h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">{isOpen ? t('collapse') : t('expand')}</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        {context.author && (
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <User className="h-3 w-3" />
            <span>{context.author}</span>
          </div>
        )}
        {showQuestionNumbers && questionNumbers.length > 0 && (
          <div className="text-muted-foreground mt-2 text-xs">
            <span className="font-medium">Questions:</span>{' '}
            {questionNumbers.map((num) => `Q${num}`).join(', ')}
          </div>
        )}
        <CollapsibleContent>
          <div>
            <MarkdownPreview content={context.content} className="text-gray-800 dark:text-gray-200" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
