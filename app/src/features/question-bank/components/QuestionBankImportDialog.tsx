import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Alert, AlertDescription } from '@ui/alert';
import { useImportQuestions } from '../hooks/useQuestionBankApi';
import { downloadCSVTemplate } from '../utils/csvTemplateGenerator';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface QuestionBankImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function QuestionBankImportDialog({ open, onClose }: QuestionBankImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors?: Array<{ row: number; error: string }>;
  } | null>(null);

  const importMutation = useImportQuestions();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const result = await importMutation.mutateAsync(selectedFile);
    setImportResult(result);

    // Close dialog if fully successful
    if (result.failed === 0) {
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setImportResult(null);
      }, 2000);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-3xl border-2 shadow-xl">
        <DialogHeader>
          <DialogTitle>Import Questions from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing questions to import into your personal question bank.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => downloadCSVTemplate()} className="gap-2">
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="flex w-full items-center justify-center">
              <label
                htmlFor="file-upload"
                className="bg-muted/10 hover:bg-muted/20 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
              >
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  {selectedFile ? (
                    <>
                      <FileSpreadsheet className="text-primary mb-2 h-8 w-8" />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">Click to upload or drag and drop</p>
                      <p className="text-muted-foreground text-xs">CSV files only</p>
                    </>
                  )}
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="space-y-2">
              {importResult.failed === 0 ? (
                <Alert className="border border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Successfully imported {importResult.success} question(s)
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Import completed with errors: {importResult.success} succeeded, {importResult.failed}{' '}
                      failed
                    </AlertDescription>
                  </Alert>

                  {/* Error Details */}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="bg-muted/30 max-h-48 overflow-y-auto rounded-md border p-3">
                      <p className="mb-2 text-xs font-medium">Error Details:</p>
                      <ul className="text-muted-foreground space-y-1 text-xs">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>
                            Row {error.row}: {error.error}
                          </li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li className="font-medium">
                            ... and {importResult.errors.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="mb-1 font-medium">CSV Format Requirements:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>First row must contain column headers</li>
                <li>Required fields: title, type, difficulty, subject, points</li>
                <li>Type-specific fields vary (options for multiple choice, pairs for matching, etc.)</li>
                <li>Use "Download Template" button to get examples for each question type</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importMutation.isPending}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {importMutation.isPending ? 'Importing...' : 'Import Questions'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
