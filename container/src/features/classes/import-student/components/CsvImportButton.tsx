/**
 * CSV Import Button Component
 *
 * Trigger button for opening the CSV import modal.
 */

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { CsvImportModal } from './CsvImportModal';

interface CsvImportButtonProps {
  classId: string;
  onSuccess?: () => void;
}

/**
 * CsvImportButton - Button to trigger CSV import modal
 *
 * Features:
 * - Opens CSV import modal on click
 * - Customizable button styling
 * - Success callback support
 *
 * @example
 * ```tsx
 * <CsvImportButton
 *   classId="class-123"
 *   onSuccess={() => toast.success('Import complete')}
 * />
 * ```
 */
export function CsvImportButton({ classId, onSuccess }: CsvImportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('classes');

  return (
    <>
      <Button variant={'outline'} size={'default'} onClick={() => setIsModalOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        {t('csvImport.buttonText')}
      </Button>

      <CsvImportModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classId={classId}
        onSuccess={onSuccess}
      />
    </>
  );
}
