/**
 * CSV Import Modal Component
 *
 * Orchestrates the CSV import workflow using a state machine (`useCsvImport`).
 * Manages the UI for each state: idle, parsing, preview, submitting, success, and error.
 */

import { useEffect } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { FileUploadZone } from './FileUploadZone';
import { CsvPreviewTable } from './CsvPreviewTable';
import { ImportProgress } from './ImportProgress';
import { ImportErrors } from './ImportErrors';
import { FormatRequirements } from './FormatRequirements';
import { useCsvImport } from '../../class-student/hooks';

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess?: () => void;
}

export function CsvImportModal({ open, onOpenChange, classId, onSuccess }: CsvImportModalProps) {
  const { t } = useTranslation('classes');
  const { state, isLoading, handleFileSelect, handleSubmit, handleReset } = useCsvImport({
    classId,
    onSuccess: () => {
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 2000);
    },
  });

  const { status, fileInfo, parseResult } = state;

  const handleDownloadTemplate = () => {
    fetch('/templates/student-import-template.csv')
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'student-import-template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(handleReset, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, handleReset]);

  const canSubmit =
    status === 'preview' &&
    parseResult?.success &&
    parseResult.data.length > 0 &&
    parseResult.data.every((row) => row._isValid);

  const getTitle = () => {
    switch (status) {
      case 'idle':
      case 'parsing':
      case 'error':
        return t('csvImport.modal.titleIdle');
      case 'preview':
      case 'submitting':
        return t('csvImport.modal.titleParsed');
      case 'success':
        return t('csvImport.modal.titleSuccess');
      default:
        return t('csvImport.modal.titleIdle');
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'idle':
        return t('csvImport.modal.descriptionIdle');
      case 'parsing':
        return t('csvImport.modal.descriptionParsing');
      case 'preview':
      case 'submitting':
        return t('csvImport.modal.descriptionParsed');
      case 'error':
        return t('csvImport.modal.descriptionError');
      default:
        return '';
    }
  };

  const showUploadZone = status === 'idle' || status === 'parsing' || status === 'error';
  const showPreview = status === 'preview' || status === 'submitting';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3/4 max-h-[90vh] !w-fit !min-w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showUploadZone && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {t('csvImport.modal.downloadTemplate')}
              </Button>
            </div>
          )}

          {showUploadZone && (
            <>
              <FileUploadZone
                onFileSelect={handleFileSelect}
                fileInfo={fileInfo}
                errors={parseResult?.errors}
                disabled={status === 'parsing'}
                className="flex w-full items-center justify-center gap-4"
              />
              {status === 'parsing' && <ImportProgress message={t('csvImport.modal.parsingFile')} />}
              {status === 'error' && parseResult && (
                <ImportErrors
                  parseErrors={parseResult.errors}
                  title={t('csvImport.modal.csvValidationFailed')}
                />
              )}
              <FormatRequirements className="mt-4" />
            </>
          )}

          {showPreview && parseResult && (
            <>
              <CsvPreviewTable data={parseResult.previewRows} totalRows={parseResult.totalRows} />
              {parseResult.warnings.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="mb-1 text-sm font-medium text-yellow-900">
                    {t('csvImport.modal.warningsTitle')}
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-yellow-700">
                    {parseResult.warnings.map((warning, idx) => (
                      <li key={idx}>{warning.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {status === 'submitting' && <ImportProgress message={t('csvImport.modal.importingStudents')} />}
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {status === 'error' && (
            <Button type="button" variant="secondary" onClick={handleReset}>
              {t('csvImport.modal.tryAgain')}
            </Button>
          )}
          {status === 'preview' && (
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isLoading}>
              {isLoading
                ? t('csvImport.modal.importing')
                : `${t('csvImport.modal.import')} ${parseResult?.data.length || 0} ${t('csvImport.preview.validRows')}`}
            </Button>
          )}
          {status === 'submitting' && (
            <Button type="button" disabled>
              {t('csvImport.modal.importing')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
