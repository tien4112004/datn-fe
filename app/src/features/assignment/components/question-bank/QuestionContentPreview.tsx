import type { QuestionBankItem } from '@/features/assignment/types';
import { QUESTION_TYPE } from '@/features/assignment/types';
import { AlertCircle } from 'lucide-react';

interface QuestionContentPreviewProps {
  question: QuestionBankItem;
}

export function QuestionContentPreview({ question }: QuestionContentPreviewProps) {
  const renderPreview = () => {
    switch (question.type) {
      case QUESTION_TYPE.MULTIPLE_CHOICE: {
        const opts = question.data.options || [];
        const correctIndex = opts.findIndex((o) => o.isCorrect);
        const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '?';

        // Check for placeholder content
        const hasPlaceholder = opts.some((o) => /^Option \d+$/.test(o.text));
        const hasEmptyOptions = opts.some((o) => !o.text?.trim());

        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {opts.length} options • Correct: {correctLetter}
            </span>
            {(hasPlaceholder || hasEmptyOptions) && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title="Has placeholder or empty content" />
            )}
          </div>
        );
      }

      case QUESTION_TYPE.MATCHING: {
        const pairs = question.data.pairs || [];
        const hasPlaceholder = pairs.some(
          (p) => /^(Left|Right) \d+$/.test(p.left) || /^(Left|Right) \d+$/.test(p.right)
        );
        const hasEmpty = pairs.some((p) => !p.left?.trim() || !p.right?.trim());

        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{pairs.length} pairs</span>
            {(hasPlaceholder || hasEmpty) && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title="Has placeholder or empty content" />
            )}
          </div>
        );
      }

      case QUESTION_TYPE.FILL_IN_BLANK: {
        const segments = question.data.segments || [];
        const blankCount = segments.filter((s) => s.type === 'blank').length;
        const hasPlaceholder = segments.some((s) => s.type === 'text' && /^Fill in the /.test(s.content));
        const hasEmptyBlanks = segments.some((s) => s.type === 'blank' && !s.content?.trim());

        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{blankCount} blank(s)</span>
            {(hasPlaceholder || hasEmptyBlanks) && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title="Has placeholder or empty content" />
            )}
          </div>
        );
      }

      case QUESTION_TYPE.OPEN_ENDED: {
        const limit = question.data.maxLength ? `${question.data.maxLength} chars` : 'unlimited';
        const hasNoAnswer = !question.data.expectedAnswer?.trim();

        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Free response ({limit})</span>
            {hasNoAnswer && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title="No expected answer provided" />
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return <div className="max-w-xs truncate">{renderPreview()}</div>;
}
