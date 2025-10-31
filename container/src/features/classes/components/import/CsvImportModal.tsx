/**
 * CSV Import Modal Component
 *
 * Simplified main orchestrator for CSV import workflow.
 * Manages the flow: Upload → Parse → Preview → Submit
 * Toast notifications handle all feedback (success/error).
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
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { FileUploadZone } from './FileUploadZone';
import { CsvPreviewTable } from './CsvPreviewTable';
import { ImportProgress } from './ImportProgress';
import { ImportErrors } from './ImportErrors';
import { FormatRequirements } from './FormatRequirements';
import { useCsvImport } from '@/features/classes/hooks/useCsvImport';

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess?: () => void;
}

/**
 * CsvImportModal - Main modal for CSV student import
 *
 * Simplified workflow:
 * - Upload and parse CSV file (with frontend validation)
 * - Show preview of parsed data
 * - Submit to backend
 * - Toast notifications for success/error feedback
 * - Auto-close on success
 *
 * @example
 * ```tsx
 * <CsvImportModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   classId="class-123"
 *   onSuccess={() => console.log('Import complete')}
 * />
 * ```
 */
export function CsvImportModal({ open, onOpenChange, classId, onSuccess }: CsvImportModalProps) {
  const { t } = useTranslation('classes');
  const { status, fileInfo, parseResult, isLoading, handleFileSelect, handleSubmit, handleReset } =
    useCsvImport({
      classId,
      onSuccess: () => {
        onSuccess?.();
        // Auto-close after 2 seconds on success
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      },
    });

  // Download template CSV file
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

  // Reset session when modal closes
  useEffect(() => {
    if (!open) {
      // Small delay to allow exit animation
      const timeout = setTimeout(handleReset, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, handleReset]);

  // Determine if submit button should be enabled
  const canSubmit =
    status === 'parsed_success' &&
    parseResult &&
    parseResult.success &&
    parseResult.data.length > 0 &&
    parseResult.data.every((row) => row._isValid);

  // Get modal title based on status
  const getTitle = () => {
    switch (status) {
      case 'idle':
      case 'file_selected':
      case 'parsing':
      case 'parsed_error':
        return t('csvImport.modal.titleIdle');
      case 'parsed_success':
      case 'submitting':
        return t('csvImport.modal.titleParsed');
      case 'completed_success':
      case 'completed_error':
        return t('csvImport.modal.titleSuccess');
      default:
        return t('csvImport.modal.titleIdle');
    }
  };

  // Get modal description based on status
  const getDescription = () => {
    switch (status) {
      case 'idle':
      case 'file_selected':
        return t('csvImport.modal.descriptionIdle');
      case 'parsing':
        return t('csvImport.modal.descriptionParsing');
      case 'parsed_success':
      case 'submitting':
        return t('csvImport.modal.descriptionParsed');
      case 'parsed_error':
        return t('csvImport.modal.descriptionError');
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3/4 max-h-[90vh] !w-fit !min-w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download and Format Info */}
          <div className="flex justify-between">
            {(status === 'idle' || status === 'file_selected' || status === 'parsed_error') && (
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

            <div className="flex gap-2">
              {/* Try Again Button (on error) */}
              {(status === 'parsed_error' || status === 'parsed_warning') && (
                <Button type="button" variant="secondary" onClick={handleReset}>
                  {t('csvImport.modal.tryAgain')}
                </Button>
              )}

              {/* Import Button (on preview) */}
              {status === 'parsed_success' && (
                <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isLoading}>
                  {isLoading
                    ? t('csvImport.modal.importing')
                    : `${t('csvImport.modal.import')} ${parseResult?.data.length || 0} ${t('csvImport.preview.validRows')}`}
                </Button>
              )}

              {/* Show Import Button during submission */}
              {status === 'submitting' && (
                <Button type="button" disabled>
                  {t('csvImport.modal.importing')}
                </Button>
              )}
            </div>
          </div>

          {/* File Upload Zone */}
          {(status === 'idle' ||
            status === 'file_selected' ||
            status === 'parsing' ||
            status === 'parsed_error') && (
            <>
              <FileUploadZone
                onFileSelect={handleFileSelect}
                fileInfo={fileInfo}
                errors={parseResult && !parseResult.success ? parseResult.errors : undefined}
                disabled={status === 'parsing'}
                className="flex w-60 w-full items-center justify-center gap-4"
              />

              {status === 'parsing' && <ImportProgress message={t('csvImport.modal.parsingFile')} />}

              {/* Show parse errors in modal */}
              {status === 'parsed_error' && parseResult && (
                <ImportErrors
                  parseErrors={parseResult.errors}
                  title={t('csvImport.modal.csvValidationFailed')}
                />
              )}

              {/* Format Requirements */}
              <FormatRequirements className="mt-4" />
            </>
          )}

          {/* Preview (parsed_success or submitting) */}
          {(status === 'parsed_success' || status === 'submitting') && parseResult && (
            <>
              <CsvPreviewTable data={parseResult.previewRows} totalRows={parseResult.totalRows} />

              {/* Warnings */}
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

              {/* Show progress during submission */}
              {status === 'submitting' && <ImportProgress message={t('csvImport.modal.importingStudents')} />}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
