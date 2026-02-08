import { useTranslation } from 'react-i18next';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

export type ExplanationMode = 'afterAssessment' | 'viewing' | 'editing' | 'grading' | 'doing';

interface ExplanationSectionProps {
  mode: ExplanationMode;
  explanation?: string;
  onChange?: (explanation: string) => void;
  compact?: boolean;
  translationKey?: string; // For custom translation keys
}

export const ExplanationSection = ({
  mode,
  explanation,
  onChange,
  compact = false,
  translationKey = 'fillInBlank',
}: ExplanationSectionProps) => {
  const { t } = useTranslation('questions');

  // Don't render in doing mode or if no explanation exists in non-editing modes
  if (mode === 'doing' || mode === 'grading') {
    return null;
  }

  if (!explanation && mode !== 'editing') {
    return null;
  }

  // Editing mode - always show with MarkdownEditor
  if (mode === 'editing') {
    return (
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{t(`${translationKey}.editing.explanation` as any)}</Label>
        <div className="rounded-lg border p-2">
          <MarkdownEditor
            value={explanation || ''}
            onChange={(value) => onChange?.(value)}
            placeholder={t(`${translationKey}.editing.explanationPlaceholder` as any)}
          />
        </div>
      </div>
    );
  }

  // AfterAssessment mode - muted background
  if (mode === 'afterAssessment') {
    return (
      <div className="bg-muted/50 rounded-md p-2">
        <h4 className="mb-2 font-semibold">{t('common.explanation')}:</h4>
        <MarkdownPreview content={explanation!} />
      </div>
    );
  }

  // Viewing mode - blue background with compact support
  if (mode === 'viewing') {
    return (
      <div
        className={cn(
          'border-muted space-y-1 rounded-lg border bg-blue-50 dark:bg-blue-900/20',
          compact ? 'p-1.5' : 'space-y-2 p-2'
        )}
      >
        <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {t(`${translationKey}.viewing.explanation` as any)}
        </Label>
        <MarkdownPreview content={explanation!} />
      </div>
    );
  }

  return null;
};
