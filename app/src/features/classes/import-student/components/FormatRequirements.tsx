/**
 * Format Requirements Component
 *
 * Displays CSV format requirements and column definitions for student import.
 * Provides users with clear guidance on data format and acceptable values.
 */

import { ChevronDown, X, Check, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface FormatRequirementsProps {
  className?: string;
}

/**
 * FormatRequirements - Shows CSV format specifications
 *
 * Features:
 * - Lists required and optional columns
 * - Shows data format examples
 * - Displays constraints (file size, row limits, etc.)
 * - Expandable/collapsible section
 * - Clear, user-friendly descriptions
 *
 * @example
 * ```tsx
 * <FormatRequirements />
 * ```
 */
export function FormatRequirements({ className = '' }: FormatRequirementsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation(I18N_NAMESPACES.CLASSES, {
    keyPrefix: 'csvImport.requirements',
  });

  const optionalColumns: Array<[string, string]> = [
    ['columnDateOfBirth', 'columnDateOfBirthDescription'],
    ['columnGender', 'columnGenderDescription'],
    ['columnAddress', 'columnAddressDescription'],
    ['columnParentName', 'columnParentNameDescription'],
    ['columnParentPhone', 'columnParentPhoneDescription'],
    ['columnParentEmail', 'columnParentEmailDescription'],
    ['columnAdditionalNotes', 'columnAdditionalNotesDescription'],
  ];

  const headerVariations: string[] = [
    'fullNameVariations',
    'dateOfBirthVariations',
    'genderVariations',
    'addressVariations',
    'parentNameVariations',
    'parentPhoneVariations',
    'parentEmailVariations',
    'additionalNotesVariations',
  ];

  return (
    <div className={className}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
      >
        <h3 className="text-sm font-semibold text-blue-900">{t('title')}</h3>
        <ChevronDown
          className={`h-5 w-5 text-blue-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-2 space-y-4 rounded-b-lg border border-t-0 border-blue-200 bg-blue-50 p-4">
          {/* File Constraints */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              {t('fileConstraints')}
            </h4>
            <ul className="list-inside list-disc space-y-1 text-xs text-blue-800">
              <li>{t('maxFileSize')}</li>
              <li>{t('fileFormat')}</li>
              <li>{t('maxRows')}</li>
              <li>{t('encoding')}</li>
            </ul>
          </div>

          {/* Required Columns */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              {t('requiredColumns')}
            </h4>
            <div className="space-y-2">
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <X className="h-3.5 w-3.5" />
                  {t('columnFullName')}
                </p>
                <p className="text-xs text-blue-700">{t('columnFullNameDescription')}</p>
              </div>
            </div>
          </div>

          {/* Optional Columns */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              {t('optionalColumns')}
            </h4>
            <div className="space-y-2">
              {optionalColumns.map(([labelKey, descKey]) => (
                <div key={labelKey} className="rounded border border-blue-100 bg-white p-2">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <Check className="h-3.5 w-3.5" />
                    {t(labelKey as never)}
                  </p>
                  <p className="text-xs text-blue-700">{t(descKey as never)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column Header Variations */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              {t('columnHeaderVariations')}
            </h4>
            <p className="mb-2 text-xs text-blue-700">{t('headerVariationsDescription')}</p>
            <div className="rounded border border-blue-100 bg-white p-2">
              <div className="space-y-1 font-mono text-xs text-blue-800">
                {headerVariations.map((key) => (
                  <div key={key}>{t(key as never)}</div>
                ))}
              </div>
            </div>
          </div>

          {/* CSV Example */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              {t('csvExample')}
            </h4>
            <p className="mb-2 text-xs text-blue-700">{t('exampleDescription')}</p>
            <div className="overflow-x-auto rounded border border-blue-100 bg-gray-900 p-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-gray-100">
                {`fullName,dateOfBirth,gender,address,parentName,parentPhone,parentContactEmail
Nguyen Van A,2008-03-15,male,123 Main St,Nguyen Thi B,555-0101,nguyen.b@example.com
Tran Thi C,2009-07-22,female,456 Oak Ave,Tran Van D,555-0102,tran.d@example.com`}
              </pre>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-yellow-900">
              <Lightbulb className="h-4 w-4" />
              {t('tips')}
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs text-yellow-800">
              <li>{t('tip1')}</li>
              <li>{t('tip2')}</li>
              <li>{t('tip3')}</li>
              <li>{t('tip4')}</li>
              <li>{t('tip5')}</li>
              <li>{t('tip6')}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
