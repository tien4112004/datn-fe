/**
 * Import Errors Component
 *
 * Simplified display for CSV parsing errors only.
 * Backend errors are now handled via toast notifications.
 */

import { AlertCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IMPORT_ERROR, type ImportError } from '@/features/classes/import-student/types/csvImport';

interface ImportErrorsProps {
  parseErrors?: ImportError[];
  title?: string;
  className?: string;
}

/**
 * ImportErrors - Error display component for CSV import
 *
 * Simplified to show only parsing errors.
 * Backend validation errors are now shown via toast notifications (like useStudentMutations).
 *
 * @example
 * ```tsx
 * <ImportErrors
 *   parseErrors={parseResult.errors}
 *   title="Failed to parse CSV"
 * />
 * ```
 */
export function ImportErrors({ parseErrors = [], title, className = '' }: ImportErrorsProps) {
  const { t } = useTranslation('classes');

  /**
   * Gets human-readable title for error type
   */
  function getErrorTitle(errorType: ImportError['type']): string {
    switch (errorType) {
      case IMPORT_ERROR.MALFORMED_CSV:
        return t('csvImport.errors.errorTitleInvalidFormat');
      case IMPORT_ERROR.MISSING_HEADERS:
        return t('csvImport.errors.errorTitleMissingHeaders');
      case IMPORT_ERROR.FILE_EMPTY:
        return t('csvImport.errors.errorTitleEmptyFile');
      case IMPORT_ERROR.NO_DATA_ROWS:
        return t('csvImport.errors.errorTitleNoDataRows');
      default:
        return t('csvImport.errors.errorTitleValidationError');
    }
  }

  /**
   * Gets actionable suggestions for error type
   */
  function getErrorSuggestions(errorType: ImportError['type']): string[] {
    switch (errorType) {
      case IMPORT_ERROR.MALFORMED_CSV:
        return [
          t('csvImport.errors.fixMalformedCsv1'),
          t('csvImport.errors.fixMalformedCsv2'),
          t('csvImport.errors.fixMalformedCsv3'),
          t('csvImport.errors.fixMalformedCsv4'),
        ];
      case IMPORT_ERROR.MISSING_HEADERS:
        return [
          t('csvImport.errors.fixMissingHeaders1'),
          t('csvImport.errors.fixMissingHeaders2'),
          t('csvImport.errors.fixMissingHeaders3'),
          t('csvImport.errors.fixMissingHeaders4'),
        ];
      case IMPORT_ERROR.FILE_EMPTY:
        return [
          t('csvImport.errors.fixEmptyFile1'),
          t('csvImport.errors.fixEmptyFile2'),
          t('csvImport.errors.fixEmptyFile3'),
        ];
      case IMPORT_ERROR.NO_DATA_ROWS:
        return [
          t('csvImport.errors.fixNoDataRows1'),
          t('csvImport.errors.fixNoDataRows2'),
          t('csvImport.errors.fixNoDataRows3'),
        ];
      default:
        return [t('csvImport.errors.fixDefaultError')];
    }
  }

  const hasErrors = parseErrors.length > 0;

  if (!hasErrors) {
    return null;
  }

  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <div className="mb-3 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-red-900">{title}</h3>
        </div>
      )}

      {/* Parse Errors */}
      <div className="space-y-3">
        {parseErrors.map((error, index) => (
          <div key={index} className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{getErrorTitle(error.type)}</p>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
                {error.details && (
                  <p className="mt-2 rounded border border-red-100 bg-white px-2 py-1 font-mono text-xs text-red-600">
                    {error.details}
                  </p>
                )}
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="mt-3 pl-8">
              <p className="mb-1 text-xs font-medium text-red-800">{t('csvImport.errors.howToFix')}</p>
              <ul className="list-inside list-disc space-y-1 text-xs text-red-700">
                {getErrorSuggestions(error.type).map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
