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
import { Checkbox } from '@ui/checkbox';
import { Badge } from '@ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { ScrollArea } from '@ui/scroll-area';
import { Download } from 'lucide-react';
import { getSubjectName, getQuestionTypeName, getDifficultyName } from '@aiprimary/core';
import type { QuestionBankItem } from '@/types/questionBank';
import { exportQuestionsToCSV } from '@/utils/csvParser';

interface QuestionBankExportDialogProps {
  open: boolean;
  onClose: () => void;
  questions: QuestionBankItem[];
}

export function QuestionBankExportDialog({ open, onClose, questions }: QuestionBankExportDialogProps) {
  const { t } = useTranslation('admin', { keyPrefix: 'questionBank.dialogs.export' });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  }, [open, questions]);

  const selectedCount = selectedIds.size;

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleToggleAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    } else {
      setSelectedIds(new Set());
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
    link.download = `question-bank-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { count: questions.length })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <ScrollArea className="max-h-[400px]">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(question.id)}
                          onCheckedChange={(checked) => handleToggle(question.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="max-w-md truncate font-medium">
                        {question.title || <span className="text-muted-foreground italic">No title</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getQuestionTypeName(question.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSubjectName(question.subject)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getDifficultyName(question.difficulty)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
