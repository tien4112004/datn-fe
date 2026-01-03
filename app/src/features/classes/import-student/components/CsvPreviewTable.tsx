/**
 * CSV Preview Table Component
 *
 * Displays a preview of parsed CSV data (first 50 rows) with validation indicators.
 * Shows column headers, highlights rows with validation errors, and displays total row count.
 */

import { AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CsvStudentRow } from '@/features/classes/import-student/types/csvImport';

interface CsvPreviewTableProps {
  data: CsvStudentRow[];
  totalRows: number;
  className?: string;
}

/**
 * CsvPreviewTable - Displays preview of CSV import data
 *
 * Features:
 * - Shows first 50 rows of parsed CSV data
 * - Displays all columns (required and optional)
 * - Highlights rows with validation errors
 * - Shows total row count
 * - Responsive table design with horizontal scroll
 *
 * @example
 * ```tsx
 * <CsvPreviewTable
 *   data={parseResult.previewRows}
 *   totalRows={parseResult.totalRows}
 * />
 * ```
 */
export function CsvPreviewTable({ data, totalRows, className = '' }: CsvPreviewTableProps) {
  const { t } = useTranslation('classes');

  if (data.length === 0) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <p className="text-sm text-gray-500">{t('csvImport.preview.noDataToPreview')}</p>
      </div>
    );
  }

  const validRowCount = data.filter((row) => row._isValid).length;
  const invalidRowCount = data.filter((row) => !row._isValid).length;

  return (
    <div className={className}>
      {/* Summary Stats */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-gray-700">
            <span className="font-semibold">{validRowCount}</span>{' '}
            {t('csvImport.preview.validRows', { count: validRowCount })}
          </span>
        </div>
        {invalidRowCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-gray-700">
              <span className="font-semibold">{invalidRowCount}</span>{' '}
              {t('csvImport.preview.rowsWithWarnings', { count: invalidRowCount })}
            </span>
          </div>
        )}
        <div className="ml-auto text-gray-500">
          {t('csvImport.preview.showingOf', { showing: data.length, total: totalRows, count: totalRows })}
        </div>
      </div>

      {/* Table Container with Scroll */}
      <div className="overflow-hidden rounded-lg border">
        <div className="max-h-96 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b bg-gray-50">
              <tr>
                <th className="w-12 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <span className="sr-only">{t('csvImport.preview.rowNumber')}</span>#
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('csvImport.preview.fullName')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('csvImport.preview.dateOfBirth')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('csvImport.preview.gender')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('csvImport.preview.address')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('csvImport.preview.phone')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('csvImport.preview.parentGuardian')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((row) => (
                <tr
                  key={row._rowNumber}
                  className={` ${!row._isValid ? 'bg-orange-50' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      {row._rowNumber}
                      {!row._isValid && <AlertCircle className="h-3 w-3 text-orange-600" />}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span className={row.fullName ? 'text-gray-900' : 'italic text-red-500'}>
                      {row.fullName || t('csvImport.preview.missing')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">{row.dateOfBirth || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">{row.gender || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">{row.address || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">{row.phoneNumber || '-'}</td>
                  <td className="px-3 py-2 text-gray-600">
                    <div className="max-w-xs truncate">
                      {row.parentGuardianName || '-'}
                      {row.parentGuardianEmail && (
                        <div className="truncate text-xs text-gray-500">{row.parentGuardianEmail}</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning for invalid rows */}
      {invalidRowCount > 0 && (
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                {t('csvImport.preview.warningTitle', { count: invalidRowCount })}
              </p>
              <p className="mt-1 text-xs text-orange-700">{t('csvImport.preview.warningMessage')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
