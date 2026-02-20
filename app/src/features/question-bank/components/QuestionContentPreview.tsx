import { useTranslation } from 'react-i18next';
import type { QuestionBankItem } from '../types';
import { QUESTION_TYPE } from '@aiprimary/core';
import { AlertCircle } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface QuestionContentPreviewProps {
  question: QuestionBankItem;
}

export function QuestionContentPreview({ question }: QuestionContentPreviewProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'assignmentEditor.questionPreview' });
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
              {t('multipleChoice', { count: opts.length, correct: correctLetter })}
            </span>
            {(hasPlaceholder || hasEmptyOptions) && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title={t('placeholderWarning')} />
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
            <span className="text-muted-foreground text-sm">{t('matching', { count: pairs.length })}</span>
            {(hasPlaceholder || hasEmpty) && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title={t('placeholderWarning')} />
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
            <span className="text-muted-foreground text-sm">{t('fillInBlank', { count: blankCount })}</span>
            {(hasPlaceholder || hasEmptyBlanks) && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title={t('placeholderWarning')} />
            )}
          </div>
        );
      }

      case QUESTION_TYPE.OPEN_ENDED: {
        const limit = question.data.maxLength
          ? t('openEnded.withLimit', { limit: question.data.maxLength })
          : t('openEnded.unlimited');
        const hasNoAnswer = !question.data.expectedAnswer?.trim();

        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{limit}</span>
            {hasNoAnswer && (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" title={t('noAnswerWarning')} />
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
