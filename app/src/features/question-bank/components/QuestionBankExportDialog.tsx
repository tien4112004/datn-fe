import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { ScrollArea } from '@ui/scroll-area';
import { Checkbox } from '@ui/checkbox';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { QuestionBankItem } from '../types';
import { QuestionBankCard } from './QuestionBankCard';
import { exportQuestionsToCSV } from '../utils/csvParser';
import { Download } from 'lucide-react';

interface QuestionBankExportDialogProps {
  open: boolean;
  onClose: () => void;
  questions: QuestionBankItem[];
}

export function QuestionBankExportDialog({ open, onClose, questions }: QuestionBankExportDialogProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'teacherQuestionBank.dialogs.export',
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Initialize selection when dialog opens or questions change
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  }, [open, questions]);

  const selectedCount = selectedIds.size;

  const handleToggleQuestion = (question: QuestionBankItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedCount === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const handleExport = () => {
    const toExport = questions.filter((q) => selectedIds.has(q.id));
    if (toExport.length === 0) return;

    const csvContent = exportQuestionsToCSV(toExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teacher-questions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl rounded-3xl border-2 shadow-xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { count: questions.length })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select All / Summary */}
          <div className="flex items-center gap-3">
            <Checkbox
              checked={
                selectedCount === questions.length ||
                (selectedCount > 0 && selectedCount < questions.length && 'indeterminate')
              }
              onCheckedChange={handleToggleAll}
              aria-label="Select all"
            />
            <span className="text-sm font-medium">
              {t('selectedCount', { selected: selectedCount, total: questions.length })}
            </span>
          </div>

          {/* Question Cards */}
          <ScrollArea className="max-h-[400px]">
            <div className="grid grid-cols-2 gap-3 pr-3">
              {questions.map((question) => (
                <QuestionBankCard
                  key={question.id}
                  question={question}
                  isSelected={selectedIds.has(question.id)}
                  onToggleSelection={handleToggleQuestion}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleExport} disabled={selectedCount === 0} className="gap-2">
            <Download className="h-4 w-4" />
            {t('exportButton', { count: selectedCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
