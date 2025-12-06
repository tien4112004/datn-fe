/**
 * Format Requirements Component
 *
 * Displays CSV format requirements and column definitions for student import.
 * Provides users with clear guidance on data format and acceptable values.
 */

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className={className}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
      >
        <h3 className="text-sm font-semibold text-blue-900">Format Requirements</h3>
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
              File Constraints
            </h4>
            <ul className="list-inside list-disc space-y-1 text-xs text-blue-800">
              <li>
                <span className="font-medium">Maximum file size:</span> 5 MB
              </li>
              <li>
                <span className="font-medium">File format:</span> CSV (.csv)
              </li>
              <li>
                <span className="font-medium">Maximum rows:</span> 1,000 students per import
              </li>
              <li>
                <span className="font-medium">Encoding:</span> UTF-8 (recommended)
              </li>
            </ul>
          </div>

          {/* Required Columns */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              Required Columns
            </h4>
            <div className="space-y-2">
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-red-700">❌ First Name</p>
                <p className="text-xs text-blue-700">
                  Student's first name. Cannot be empty. Accepts spaces and special characters (e.g.,
                  "Mary-Jane", "José").
                </p>
              </div>
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-red-700">❌ Last Name</p>
                <p className="text-xs text-blue-700">
                  Student's last name. Cannot be empty. Accepts spaces and special characters (e.g.,
                  "O'Brien", "von Neumann").
                </p>
              </div>
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-red-700">❌ Email</p>
                <p className="text-xs text-blue-700">
                  Student's email address. Must be unique in the class. Format: name@domain.com
                </p>
              </div>
            </div>
          </div>

          {/* Optional Columns */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              Optional Columns
            </h4>
            <div className="space-y-2">
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-green-700">✓ Date of Birth</p>
                <p className="text-xs text-blue-700">
                  Format: YYYY-MM-DD (e.g., 2008-03-15). Supports: dob, birthdate, birth_date
                </p>
              </div>
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-green-700">✓ Phone Number</p>
                <p className="text-xs text-blue-700">
                  Student's phone number. Any format accepted (e.g., 555-0101, +1-555-0101). Supports: phone,
                  mobile, cell
                </p>
              </div>
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-green-700">✓ Parent/Guardian Name</p>
                <p className="text-xs text-blue-700">
                  Name of parent or guardian. Supports: parent_name, guardian_name, parent/guardian name
                </p>
              </div>
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-green-700">✓ Parent/Guardian Email</p>
                <p className="text-xs text-blue-700">
                  Email address of parent or guardian. Format: name@domain.com
                </p>
              </div>
              <div className="rounded border border-blue-100 bg-white p-2">
                <p className="mb-1 text-xs font-medium text-green-700">✓ Additional Notes</p>
                <p className="text-xs text-blue-700">
                  Any additional information about the student. Supports: notes, comments, remarks
                </p>
              </div>
            </div>
          </div>

          {/* Header Naming */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              Column Header Variations
            </h4>
            <p className="mb-2 text-xs text-blue-700">
              Column headers are case-insensitive and flexible. The system recognizes common variations:
            </p>
            <div className="rounded border border-blue-100 bg-white p-2">
              <p className="space-y-1 font-mono text-xs text-blue-800">
                <div>First Name: "First Name", "firstname", "first_name", "fname", "FIRST NAME"</div>
                <div>Last Name: "Last Name", "lastname", "last_name", "lname", "surname"</div>
                <div>Email: "Email", "e-mail", "emailaddress", "mail"</div>
              </p>
            </div>
          </div>

          {/* CSV Example */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              Example CSV Format
            </h4>
            <div className="overflow-x-auto rounded border border-blue-100 bg-gray-900 p-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-gray-100">
                {`First Name,Last Name,Email,Date of Birth,Phone Number
John,Smith,john@example.com,2008-03-15,555-0101
Sarah,Johnson,sarah@example.com,2009-07-22,555-0102
Michael,Williams,michael@example.com,2008-11-08,555-0103`}
              </pre>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
            <p className="mb-2 text-xs font-semibold text-yellow-900">💡 Tips for successful import:</p>
            <ul className="list-inside list-disc space-y-1 text-xs text-yellow-800">
              <li>Ensure all emails are unique within your class</li>
              <li>Use consistent date format (YYYY-MM-DD) for dates</li>
              <li>Empty optional fields are allowed</li>
              <li>Remove extra spaces before/after cell values</li>
              <li>Save your file as CSV format (.csv)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
