import { useState, useMemo } from 'react';
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
import { Input } from '@ui/input';
import { Alert, AlertDescription } from '@ui/alert';
import { Badge } from '@ui/badge';
import { ScrollArea } from '@ui/scroll-area';
import { Checkbox } from '@ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useCreateQuestions } from '../hooks/useQuestionBankApi';
import { downloadCSVTemplate } from '../utils/csvTemplateGenerator';
import { parseQuestionBankCSV } from '../utils/csvParser';
import { validateQuestionBankCSV } from '../utils/csvValidation';
import type { ValidationResult } from '../utils/csvValidation';
import type { QuestionBankItem } from '../types';
import { QuestionBankCard } from './QuestionBankCard';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface QuestionBankImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function QuestionBankImportDialog({ open, onClose }: QuestionBankImportDialogProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'teacherQuestionBank.dialogs.import',
  });

  // File & parse state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Preview state
  const [parsedQuestions, setParsedQuestions] = useState<QuestionBankItem[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Result state
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors?: Array<{ row: number; error: string }>;
  } | null>(null);

  const createQuestionsMutation = useCreateQuestions();

  // Derived state
  const hasPreview = parsedQuestions.length > 0;
  const selectedCount = selectedIds.size;
  const hasErrors = validation ? validation.errors.length > 0 : false;
  const hasWarnings = validation ? validation.warnings.length > 0 : false;

  // Map validation errors/warnings by row number for per-question indicators
  const errorsByRow = useMemo(() => {
    if (!validation) return new Map<number, string[]>();
    const map = new Map<number, string[]>();
    for (const err of [...validation.errors, ...validation.warnings]) {
      const existing = map.get(err.row) || [];
      existing.push(err.message);
      map.set(err.row, existing);
    }
    return map;
  }, [validation]);

  // Parse file immediately on selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setImportResult(null);

    try {
      const content = await file.text();
      const questions = parseQuestionBankCSV(content);
      const result = validateQuestionBankCSV(questions);

      setParsedQuestions(questions);
      setValidation(result);
      setSelectedIds(new Set(questions.map((q) => q.id)));
    } catch (error) {
      setParseError(error instanceof Error ? error.message : t('parseError'));
      setParsedQuestions([]);
      setValidation(null);
      setSelectedIds(new Set());
    }
  };

  const handleImport = async () => {
    const toImport = parsedQuestions.filter((q) => selectedIds.has(q.id));
    if (toImport.length === 0) return;

    try {
      const toCreate = toImport.map(
        ({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data }) => data
      );
      await createQuestionsMutation.mutateAsync(toCreate);
      setImportResult({ success: toImport.length, failed: 0 });
    } catch {
      setImportResult({
        success: 0,
        failed: toImport.length,
        errors: [{ row: 0, error: 'Failed to create questions. Please try again.' }],
      });
    }
  };

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
    if (selectedCount === parsedQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(parsedQuestions.map((q) => q.id)));
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseError(null);
    setParsedQuestions([]);
    setValidation(null);
    setSelectedIds(new Set());
    setImportResult(null);
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'rounded-3xl border-2 shadow-xl',
          hasPreview && !importResult ? '!max-w-4xl' : '!max-w-2xl'
        )}
      >
        <DialogHeader>
          <DialogTitle>{importResult ? t('titleResult') : t('title')}</DialogTitle>
          <DialogDescription>
            {importResult
              ? t('descriptionResult')
              : hasPreview
                ? t('descriptionPreview', { count: parsedQuestions.length })
                : t('descriptionUpload')}
          </DialogDescription>
        </DialogHeader>

        {/* ========== RESULT ========== */}
        {importResult ? (
          <div className="space-y-4">
            {importResult.success > 0 && importResult.failed === 0 ? (
              <Alert className="border border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  {t('successMessage', { count: importResult.success })}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('errorMessage', {
                      success: importResult.success,
                      failed: importResult.failed,
                    })}
                  </AlertDescription>
                </Alert>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="bg-muted/30 max-h-48 overflow-y-auto rounded-md border p-3">
                    <p className="mb-2 text-xs font-medium">{t('errorDetails')}</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>
                          Row {error.row}: {error.error}
                        </li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li className="font-medium">
                          {t('moreDetailErrors', { count: importResult.errors.length - 5 })}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Upload Area */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label
                  htmlFor="file-upload"
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 transition-colors',
                    hasPreview ? 'py-2' : 'py-6',
                    'bg-muted/10 hover:bg-muted/20'
                  )}
                >
                  {selectedFile ? (
                    <>
                      <FileSpreadsheet className="text-primary h-5 w-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        {t('changeFile')}
                      </Badge>
                    </>
                  ) : (
                    <div className="flex w-full flex-col items-center py-4">
                      <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">{t('uploadText')}</p>
                      <p className="text-muted-foreground text-xs">{t('uploadHint')}</p>
                    </div>
                  )}
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSVTemplate()}
                className="shrink-0 gap-2"
              >
                <Download className="h-4 w-4" />
                {t('template')}
              </Button>
            </div>

            {/* Parse Error */}
            {parseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            {/* Instructions (only when no file selected) */}
            {!hasPreview && !parseError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <p className="mb-1 font-medium">{t('formatTitle')}</p>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>{t('formatRules.headers')}</li>
                    <li>{t('formatRules.required')}</li>
                    <li>{t('formatRules.optional')}</li>
                    <li>{t('formatRules.typeSpecific')}</li>
                    <li>{t('formatRules.templateHint')}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* ========== PREVIEW ========== */}
            {hasPreview && (
              <>
                {/* Validation Alerts */}
                {hasErrors && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="mb-1 font-medium">
                        {t('validationErrors', { count: validation!.errors.length })}
                      </p>
                      <ul className="list-inside list-disc space-y-0.5 text-xs">
                        {validation!.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>
                            Row {err.row}
                            {err.field ? ` (${err.field})` : ''}: {err.message}
                          </li>
                        ))}
                        {validation!.errors.length > 5 && (
                          <li className="font-medium">
                            {t('moreErrors', { count: validation!.errors.length - 5 })}
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {hasWarnings && !hasErrors && (
                  <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                      <p className="mb-1 text-sm font-medium">
                        {t('validationWarnings', { count: validation!.warnings.length })}
                      </p>
                      <ul className="list-inside list-disc space-y-0.5 text-xs">
                        {validation!.warnings.slice(0, 3).map((warn, i) => (
                          <li key={i}>
                            Row {warn.row}
                            {warn.field ? ` (${warn.field})` : ''}: {warn.message}
                          </li>
                        ))}
                        {validation!.warnings.length > 3 && (
                          <li className="font-medium">
                            {t('moreWarnings', { count: validation!.warnings.length - 3 })}
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Select All / Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={
                        selectedCount === parsedQuestions.length ||
                        (selectedCount > 0 && selectedCount < parsedQuestions.length && 'indeterminate')
                      }
                      onCheckedChange={handleToggleAll}
                      aria-label="Select all"
                    />
                    <span className="text-sm font-medium">
                      {t('selectedCount', { selected: selectedCount, total: parsedQuestions.length })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasErrors && (
                      <Badge variant="destructive" className="text-xs">
                        {t('errorBadge', { count: validation!.errors.length })}
                      </Badge>
                    )}
                    {hasWarnings && (
                      <Badge variant="outline" className="border-yellow-500 text-xs text-yellow-600">
                        {t('warningBadge', { count: validation!.warnings.length })}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Question Cards */}
                <ScrollArea className="max-h-[400px]">
                  <div className="grid grid-cols-2 gap-3 pr-3">
                    {parsedQuestions.map((question, index) => {
                      const rowNumber = index + 2;
                      const rowIssues = errorsByRow.get(rowNumber);
                      return (
                        <div key={question.id} className="relative">
                          {rowIssues && (
                            <div className="absolute -right-1 -top-1 z-10" title={rowIssues.join('\n')}>
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </div>
                          )}
                          <QuestionBankCard
                            question={question}
                            isSelected={selectedIds.has(question.id)}
                            onToggleSelection={handleToggleQuestion}
                          />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}

        {/* ========== FOOTER ========== */}
        <DialogFooter>
          {importResult ? (
            <Button variant="outline" onClick={handleClose}>
              {t('close')}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t('cancel')}
              </Button>
              {hasPreview && (
                <Button
                  onClick={handleImport}
                  disabled={selectedCount === 0 || hasErrors || createQuestionsMutation.isPending}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {createQuestionsMutation.isPending
                    ? t('importing')
                    : t('importButton', { count: selectedCount })}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
