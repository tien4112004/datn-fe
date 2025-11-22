/**
 * Import Progress Component
 *
 * Displays loading indicator and progress message during CSV import submission.
 */

import { Loader2 } from 'lucide-react';

interface ImportProgressProps {
  message?: string;
  className?: string;
}

/**
 * ImportProgress - Loading state indicator for import process
 *
 * Features:
 * - Animated spinner
 * - Customizable progress message
 * - Centered layout
 *
 * @example
 * ```tsx
 * <ImportProgress message="Importing students..." />
 * ```
 */
export function ImportProgress({ message = 'Importing students...', className = '' }: ImportProgressProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  );
}
