import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { MarkdownPreview } from '@/features/question/components/shared/MarkdownPreview';
import type { Context } from '../../types/context';

interface ContextDisplayProps {
  context: Context;
  defaultCollapsed?: boolean;
}

export const ContextDisplay = ({ context, defaultCollapsed = false }: ContextDisplayProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'context' });
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-base text-blue-900 dark:text-blue-100">
                {context.title || t('readingPassage')}
              </CardTitle>
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
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-2">
            <MarkdownPreview content={context.content} className="text-gray-800 dark:text-gray-200" />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
