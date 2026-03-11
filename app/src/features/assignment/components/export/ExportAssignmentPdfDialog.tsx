import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@ui/dialog';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { Checkbox } from '@ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useExportAssignmentPdf } from '../../hooks/useAssignmentApi';
import type { ExportAssignmentPdfOptions, ExportPdfTheme } from '../../types';
import { toast } from 'sonner';

export const PDF_HEADER_STORAGE_KEY = 'pdf-export-header';

interface PdfHeaderFields {
  departmentName: string;
  institutionName: string;
  examPeriod: string;
  examDuration: string;
}

function loadHeaderFields(): PdfHeaderFields {
  try {
    const raw = localStorage.getItem(PDF_HEADER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt data
  }
  return { departmentName: '', institutionName: '', examPeriod: '', examDuration: '' };
}

function saveHeaderFields(fields: PdfHeaderFields) {
  localStorage.setItem(PDF_HEADER_STORAGE_KEY, JSON.stringify(fields));
}

interface ExportAssignmentPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  assignmentTitle: string;
}

export const ExportAssignmentPdfDialog = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
}: ExportAssignmentPdfDialogProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'exportPdf' });

  const [theme, setTheme] = useState<ExportPdfTheme>('CLASSIC');
  const [useExamHeader, setUseExamHeader] = useState(false);
  const [headerFields, setHeaderFields] = useState<PdfHeaderFields>(loadHeaderFields);
  const [showChapter, setShowChapter] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showQuestionPoints, setShowQuestionPoints] = useState(true);

  const updateHeaderField = useCallback((field: keyof PdfHeaderFields, value: string) => {
    setHeaderFields((prev) => {
      const next = { ...prev, [field]: value };
      saveHeaderFields(next);
      return next;
    });
  }, []);

  const exportPdf = useExportAssignmentPdf();
  const [exportingType, setExportingType] = useState<'exam' | 'answer' | null>(null);

  const buildOptions = (overrides: Partial<ExportAssignmentPdfOptions> = {}): ExportAssignmentPdfOptions => ({
    theme,
    headerConfig: {
      useExamHeader,
      ...(useExamHeader
        ? {
            departmentName: headerFields.departmentName.trim() || null,
            institutionName: headerFields.institutionName.trim() || null,
            examPeriod: headerFields.examPeriod.trim() || null,
            examDuration: headerFields.examDuration.trim() || null,
          }
        : {}),
      showChapter,
      showDescription,
    },
    showQuestionPoints,
    showAnswerKey: false,
    showExplanations: false,
    ...overrides,
  });

  const handleExportExam = async () => {
    setExportingType('exam');
    try {
      await exportPdf.mutateAsync({
        id: assignmentId,
        options: buildOptions(),
        filename: assignmentTitle,
      });
      toast.success(t('exportSuccess'));
      onOpenChange(false);
    } catch {
      toast.error(t('exportError'));
    } finally {
      setExportingType(null);
    }
  };

  const handleExportAnswer = async () => {
    setExportingType('answer');
    try {
      await exportPdf.mutateAsync({
        id: assignmentId,
        options: buildOptions({ showAnswerKey: true, showExplanations: true }),
        filename: `${assignmentTitle} - ${t('answerSuffix')}`,
      });
      toast.success(t('exportSuccess'));
      onOpenChange(false);
    } catch {
      toast.error(t('exportError'));
    } finally {
      setExportingType(null);
    }
  };

  const isExporting = exportingType !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Theme */}
          <div className="space-y-2">
            <Label>{t('theme.label')}</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as ExportPdfTheme)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLASSIC">{t('theme.classic')}</SelectItem>
                <SelectItem value="FRIENDLY">{t('theme.friendly')}</SelectItem>
                <SelectItem value="COMPACT">{t('theme.compact')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Header options */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
              {t('header.label')}
            </Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={useExamHeader} onCheckedChange={(v) => setUseExamHeader(Boolean(v))} />
                {t('header.useExamHeader')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={showChapter} onCheckedChange={(v) => setShowChapter(Boolean(v))} />
                {t('header.showChapter')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={showDescription} onCheckedChange={(v) => setShowDescription(Boolean(v))} />
                {t('header.showDescription')}
              </label>
            </div>
            {useExamHeader && (
              <div className="space-y-2">
                <Input
                  value={headerFields.departmentName}
                  onChange={(e) => updateHeaderField('departmentName', e.target.value)}
                  placeholder={t('header.departmentName.placeholder')}
                />
                <Input
                  value={headerFields.institutionName}
                  onChange={(e) => updateHeaderField('institutionName', e.target.value)}
                  placeholder={t('header.institutionName.placeholder')}
                />
                <Input
                  value={headerFields.examPeriod}
                  onChange={(e) => updateHeaderField('examPeriod', e.target.value)}
                  placeholder={t('header.examPeriod.placeholder')}
                />
                <Input
                  value={headerFields.examDuration}
                  onChange={(e) => updateHeaderField('examDuration', e.target.value)}
                  placeholder={t('header.examDuration.placeholder')}
                />
              </div>
            )}
          </div>

          {/* Content options */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
              {t('content.label')}
            </Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={showQuestionPoints}
                  onCheckedChange={(v) => setShowQuestionPoints(Boolean(v))}
                />
                {t('content.showQuestionPoints')}
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleExportExam} disabled={isExporting} className="w-full">
            {exportingType === 'exam' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            {t('exportExam')}
          </Button>
          <Button onClick={handleExportAnswer} disabled={isExporting} variant="outline" className="w-full">
            {exportingType === 'answer' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {t('exportAnswer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
