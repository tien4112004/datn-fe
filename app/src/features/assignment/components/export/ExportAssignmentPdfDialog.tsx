import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@ui/dialog';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { Checkbox } from '@ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useExportAssignmentPdf } from '../../hooks/useAssignmentApi';
import type { ExportAssignmentPdfOptions, ExportPdfTheme } from '../../types';
import { toast } from 'sonner';

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
  const [departmentName, setDepartmentName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [examPeriod, setExamPeriod] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [showChapter, setShowChapter] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showQuestionPoints, setShowQuestionPoints] = useState(true);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const exportPdf = useExportAssignmentPdf();

  const handleExport = async () => {
    const options: ExportAssignmentPdfOptions = {
      theme,
      headerConfig: {
        departmentName: departmentName.trim() || null,
        institutionName: institutionName.trim() || null,
        examPeriod: examPeriod.trim() || null,
        examDuration: examDuration.trim() || null,
        showChapter,
        showDescription,
      },
      showQuestionPoints,
      showAnswerKey,
      showExplanations,
    };

    try {
      await exportPdf.mutateAsync({ id: assignmentId, options, filename: assignmentTitle });
      toast.success(t('exportSuccess'));
      onOpenChange(false);
    } catch {
      toast.error(t('exportError'));
    }
  };

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

          {/* Header fields */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
              {t('header.label')}
            </Label>
            <div className="space-y-2">
              <Input
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder={t('header.departmentName.placeholder')}
              />
              <Input
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder={t('header.institutionName.placeholder')}
              />
              <Input
                value={examPeriod}
                onChange={(e) => setExamPeriod(e.target.value)}
                placeholder={t('header.examPeriod.placeholder')}
              />
              <Input
                value={examDuration}
                onChange={(e) => setExamDuration(e.target.value)}
                placeholder={t('header.examDuration.placeholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={showChapter} onCheckedChange={(v) => setShowChapter(Boolean(v))} />
                {t('header.showChapter')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={showDescription} onCheckedChange={(v) => setShowDescription(Boolean(v))} />
                {t('header.showDescription')}
              </label>
            </div>
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
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={showAnswerKey} onCheckedChange={(v) => setShowAnswerKey(Boolean(v))} />
                {t('content.showAnswerKey')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={showExplanations}
                  onCheckedChange={(v) => setShowExplanations(Boolean(v))}
                />
                {t('content.showExplanations')}
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exportPdf.isPending}>
            {t('cancel')}
          </Button>
          <Button onClick={handleExport} disabled={exportPdf.isPending}>
            {exportPdf.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('exporting')}
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                {t('export')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
