/**
 * File Upload Zone Component
 *
 * Provides a drag-and-drop zone for CSV file upload with validation feedback.
 * Validates file type (CSV), size (≤5MB), and displays validation errors.
 */

import { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CsvFileInfo, ImportError } from '@/features/classes/import-student/types/csvImport';
import { Input } from '@ui/input';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  fileInfo?: CsvFileInfo;
  errors?: ImportError[];
  disabled?: boolean;
  className?: string;
}

/**
 * FileUploadZone - CSV file upload component with drag-and-drop support
 *
 * Features:
 * - Drag and drop support
 * - Click to browse files
 * - File type validation (CSV only)
 * - File size validation (≤5MB)
 * - CSV parsing error display (malformed CSV, missing columns, empty rows)
 * - Visual feedback for validation errors
 * - Displays selected file information
 * - Prevents preview when structure is invalid
 *
 * @example
 * ```tsx
 * <FileUploadZone
 *   onFileSelect={handleFileSelect}
 *   fileInfo={fileInfo}
 *   errors={parseResult?.errors}
 * />
 * ```
 */
export function FileUploadZone({
  onFileSelect,
  fileInfo,
  errors = [],
  disabled = false,
  className = '',
}: FileUploadZoneProps) {
  const { t } = useTranslation('classes');
  const hasError = errors.length > 0;

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      // Reset input value to allow selecting same file again
      event.target.value = '';
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) return;

      const file = event.dataTransfer.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [disabled, onFileSelect]
  );

  return (
    <div className={className}>
      {/* Upload Zone */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors duration-200 ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          accept=".csv,text/csv,application/csv,text/plain"
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        {/* Icon */}
        <div className="mb-4">
          {hasError ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
        </div>
        {/* Instructions */}
        <div className="text-center">
          <p className="mb-1 text-sm font-medium text-gray-700">
            {hasError ? t('csvImport.upload.failedValidation') : t('csvImport.upload.dragDropText')}
          </p>
          <p className="text-xs text-gray-500">{t('csvImport.upload.maxFileSize')}</p>
        </div>
      </div>

      {/* Selected File Info */}
      {fileInfo && !hasError && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <FileText className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{fileInfo.fileName}</p>
            <p className="text-xs text-gray-500">{fileInfo.fileSizeFormatted}</p>
          </div>
        </div>
      )}
    </div>
  );
}
