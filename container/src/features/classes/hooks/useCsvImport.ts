import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { classApiService } from '../api';
import { prepareFileInfo, validateAndParseCsv } from '../utils/csvValidators';
import { type ImportStatus, type CsvFileInfo, type CsvParseResult, IMPORT_ERROR } from '../types/csvImport';

interface UseCsvImportReturn {
  status: ImportStatus;
  fileInfo: CsvFileInfo | undefined;
  parseResult: CsvParseResult | undefined;
  isLoading: boolean;
  handleFileSelect: (file: File | null) => Promise<void>;
  handleSubmit: () => void;
  handleReset: () => void;
}

interface UseCsvImportOptions {
  classId: string;
  onSuccess?: () => void;
}

export function useCsvImport({ classId, onSuccess }: UseCsvImportOptions): UseCsvImportReturn {
  const { t } = useTranslation('classes');
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [fileInfo, setFileInfo] = useState<CsvFileInfo | undefined>(undefined);
  const [parseResult, setParseResult] = useState<CsvParseResult | undefined>(undefined);

  // Mutation for submitting to backend
  const importMutation = useMutation({
    mutationFn: () => {
      if (!fileInfo) {
        throw new Error('No file selected');
      }
      return classApiService.submitImport(classId, fileInfo.file);
    },
    onMutate: () => {
      setStatus('submitting');
    },
    onSuccess: () => {
      toast.success(t('csvImport.toast.importSuccess'));
      onSuccess?.(); // Call parent callback for data refetch
      // Reset state after successful import
      setStatus('idle');
      setFileInfo(undefined);
      setParseResult(undefined);
    },
    onError: (error: Error) => {
      setStatus('parsed_success'); // Reset to preview state so user can retry
      toast.error(error.message || t('csvImport.toast.importFailed'));
    },
  });

  const handleFileSelect = async (file: File | null): Promise<void> => {
    if (!file) {
      setStatus('idle');
      setFileInfo(undefined);
      setParseResult(undefined);
      return;
    }

    setStatus('parsing');

    // Prepare file info and validate
    const { fileInfo: preparedFileInfo, errors } = prepareFileInfo(file);
    setFileInfo(preparedFileInfo);

    if (errors.length > 0) {
      setStatus('parsed_error');
      setParseResult({
        success: false,
        data: [],
        totalRows: 0,
        previewRows: [],
        errors,
        warnings: [],
      });
      return;
    }

    // Parse CSV
    try {
      const result = await validateAndParseCsv(file);
      setParseResult(result);
      if (result.warnings.length > 0 && result.success) {
        setStatus('parsed_warning');
      } else {
        setStatus('parsed_success');
      }
    } catch (error) {
      setStatus('parsed_error');
      setParseResult({
        success: false,
        data: [],
        totalRows: 0,
        previewRows: [],
        errors: [
          {
            type: IMPORT_ERROR.MALFORMED_CSV,
            message: error instanceof Error ? error.message : t('csvImport.toast.parseError'),
          },
        ],
        warnings: [],
      });
    }
  };

  const handleSubmit = (): void => {
    if (!parseResult || !parseResult.success || parseResult.data.length === 0) {
      toast.error(t('csvImport.toast.genericError'));
      return;
    }

    importMutation.mutate();
  };

  const handleReset = (): void => {
    setStatus('idle');
    setFileInfo(undefined);
    setParseResult(undefined);
    importMutation.reset();
  };

  return {
    status,
    fileInfo,
    parseResult,
    isLoading: status === 'parsing' || importMutation.isPending,
    handleFileSelect,
    handleSubmit,
    handleReset,
  };
}
