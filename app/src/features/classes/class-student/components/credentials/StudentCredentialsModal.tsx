import { useTranslation } from 'react-i18next';
import { Printer, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import './print-styles.css';
import type { StudentCredential } from '../../types/credentials';

/**
 * Props for the StudentCredentialsModal component
 */
export interface CredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: StudentCredential[];
  mode: 'single' | 'bulk'; // single = manual creation, bulk = CSV import
}

/**
 * Modal component for displaying student credentials after creation/import
 *
 * Features:
 * - Displays credentials in a clean table format
 * - Print-friendly layout with browser print dialog
 * - Security warning about one-time display
 * - Automatic cleanup of sensitive data when closed
 * - Print-only header and footer with generation date
 *
 * @example
 * ```tsx
 * <StudentCredentialsModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   credentials={[{
 *     studentId: '123',
 *     fullName: 'John Doe',
 *     username: 'johndoe123',
 *     password: 'Temp@ABC123'
 *   }]}
 *   mode="single"
 * />
 * ```
 */
export function StudentCredentialsModal({ open, onOpenChange, credentials }: CredentialsModalProps) {
  const { t } = useTranslation('classes', { keyPrefix: 'credentials' });

  // Don't render if no credentials
  if (credentials.length === 0) {
    return null;
  }

  const handlePrint = () => {
    if (!window.print) {
      console.error('Print functionality not supported');
      return;
    }
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl print:max-w-full">
        {/* Screen-only header */}
        <DialogHeader className="print:hidden">
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>{t('modal.description')}</DialogDescription>
        </DialogHeader>

        {/* Main printable content area */}
        <div id="credentials-print-area" className="space-y-4">
          {/* Print-only header */}
          <div className="hidden print:block">
            <h1 className="text-2xl font-bold">{t('print.title')}</h1>
            <p className="text-sm text-gray-600">{t('print.subtitle')}</p>
          </div>

          {/* Security warning - screen only */}
          <div className="flex gap-3 rounded-lg bg-amber-50 p-4 print:hidden">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">{t('modal.warning')}</p>
          </div>

          {/* Credentials table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">{t('table.studentName')}</TableHead>
                  <TableHead className="w-1/3">{t('table.username')}</TableHead>
                  <TableHead className="w-1/3">{t('table.password')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((credential) => (
                  <TableRow key={credential.studentId}>
                    <TableCell className="font-medium">{credential.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">{credential.username}</TableCell>
                    <TableCell className="font-mono text-sm">{credential.password}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Print-only footer */}
          <div className="hidden print:block">
            <p className="border-t pt-4 text-sm text-gray-500">
              {t('print.footer', {
                date: new Date().toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              })}
            </p>
          </div>
        </div>

        {/* Screen-only footer with buttons */}
        <DialogFooter className="print:hidden">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('modal.close')}
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('modal.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
