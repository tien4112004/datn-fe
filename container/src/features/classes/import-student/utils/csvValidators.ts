/**
 * CSV Import Service
 *
 * Orchestrates the CSV import process by combining file validation,
 * CSV parsing, and API submission.
 */

import {
  IMPORT_ERROR,
  MAX_FILE_SIZE,
  ACCEPTED_MIME_TYPES,
  type CsvFileInfo,
  type CsvParseResult,
  type ImportError,
} from '@/features/classes/import-student/types/csvImport';
import { parseCsvFile } from '@/features/classes/import-student/utils/csvParser';

/**
 * Validates and prepares file information
 *
 * @param file - Browser File object
 * @returns File information object and an array of validation errors
 */
export function prepareFileInfo(file: File): { fileInfo: CsvFileInfo; errors: ImportError[] } {
  const errors = validateFile(file);

  const fileInfo: CsvFileInfo = {
    file,
    fileName: file.name,
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size),
    uploadedAt: new Date(),
  };

  return { fileInfo, errors };
}

/**
 * Validates and parses CSV file
 *
 * @param file - Browser File object
 * @returns Parse result with student data or errors
 *
 * @example
 * ```typescript
 * const result = await validateAndParseCsv(file);
 * if (result.success) {
 *   console.log('Successfully parsed', result.totalRows, 'students');
 * }
 * ```
 */
export async function validateAndParseCsv(file: File): Promise<CsvParseResult> {
  // First validate the file
  const validationErrors = validateFile(file);

  if (validationErrors.length > 0) {
    // Return file validation errors as parse errors
    return {
      success: false,
      data: [],
      totalRows: 0,
      previewRows: [],
      errors: validationErrors,
      warnings: [],
    };
  }

  // Parse the CSV file
  return parseCsvFile(file);
}

/**
 * Validates a file for CSV import
 *
 * @param file - Browser File object to validate
 * @returns An array of import errors, empty if valid
 *
 * @example
 * ```typescript
 * const errors = validateFile(file);
 * if (errors.length > 0) {
 *   console.error('Validation errors:', errors);
 * }
 * ```
 */
export function validateFile(file: File): ImportError[] {
  const errors: ImportError[] = [];

  // Check if file is empty
  if (file.size === 0) {
    errors.push({
      type: IMPORT_ERROR.FILE_EMPTY,
      message: 'The selected file is empty. Please choose a valid CSV file.',
    });
  }

  // Check file size (≤5MB)
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    errors.push({
      type: IMPORT_ERROR.FILE_SIZE,
      message: `File size (${sizeMB} MB) exceeds the maximum allowed size of ${maxSizeMB} MB.`,
    });
  }

  // Check MIME type
  const isValidMimeType = ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number]);

  // Also check file extension as fallback (some browsers don't set MIME type correctly)
  const hasValidExtension = file.name.toLowerCase().endsWith('.csv');

  if (!isValidMimeType && !hasValidExtension) {
    errors.push({
      type: IMPORT_ERROR.MIME_TYPE,
      message: `Invalid file type. Please upload a CSV file (accepted types: ${ACCEPTED_MIME_TYPES.join(', ')}).`,
    });
  }

  return errors;
}

/**
 * Formats file size to human-readable string
 *
 * @param bytes - File size in bytes
 * @returns Formatted string like "2.5 MB" or "150 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
