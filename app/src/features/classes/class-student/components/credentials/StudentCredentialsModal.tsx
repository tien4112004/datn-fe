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
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;

    const rows = credentials
      .map(
        (c) =>
          `<tr>
            <td>${c.fullName}</td>
            <td class="mono">${c.username}</td>
            <td class="mono">${c.password}</td>
          </tr>`
      )
      .join('');

    const generatedDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${t('print.title')}</title>
  <style>
    @page { margin: 0.5in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; font-size: 11pt; color: #111; }
    h1 { font-size: 18pt; margin-bottom: 4px; }
    .subtitle { font-size: 10pt; color: #555; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    th {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
    }
    td {
      border: 1px solid #d1d5db;
      padding: 8px 10px;
    }
    tr { page-break-inside: avoid; }
    .mono { font-family: 'Courier New', Courier, monospace; font-size: 10pt; }
    .footer { margin-top: 24px; border-top: 1px solid #d1d5db; padding-top: 12px; font-size: 9pt; color: #666; }
  </style>
</head>
<body>
  <h1>${t('print.title')}</h1>
  <p class="subtitle">${t('print.subtitle')}</p>
  <table>
    <thead>
      <tr>
        <th>${t('table.studentName')}</th>
        <th>${t('table.username')}</th>
        <th>${t('table.password')}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">${t('print.footer', { date: generatedDate })}</div>
</body>
</html>`);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>{t('modal.description')}</DialogDescription>
        </DialogHeader>

        {/* Main content area */}
        <div className="space-y-4">
          {/* Security warning */}
          <div className="flex gap-3 rounded-lg bg-amber-50 p-4">
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
        </div>

        <DialogFooter>
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
