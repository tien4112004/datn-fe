import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { classApiService } from '../../shared/api';
import { prepareFileInfo, validateAndParseCsv } from '../utils/csvValidators';
import { useCsvImportStore } from './csvImportStore';
import type { CsvParseResult } from '../../class-student';
import type { ImportResult } from '../../shared/types/service';

interface UseCsvImportOptions {
  classId: string;
  onSuccess?: (result: ImportResult) => void;
}

export function useCsvImport({ classId, onSuccess }: UseCsvImportOptions) {
  const { t } = useTranslation('classes');
  const queryClient = useQueryClient();
  const [state, dispatch] = useCsvImportStore();

  const importMutation = useMutation({
    mutationFn: (file: File) => classApiService.submitImport(classId, file),
    onMutate: () => {
      dispatch({ type: 'SUBMIT' });
    },
    onSuccess: (result: ImportResult) => {
      toast.success(t('csvImport.toast.importSuccess', { count: result.studentsCreated ?? 0 }));
      dispatch({ type: 'SUBMIT_SUCCESS' });
      queryClient.invalidateQueries({ queryKey: ['classes', 'students', classId] });
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('csvImport.toast.importFailed'));
      dispatch({ type: 'SUBMIT_ERROR', payload: error.message });
    },
  });

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      dispatch({ type: 'RESET' });
      return;
    }

    const { fileInfo, errors } = prepareFileInfo(file);
    dispatch({ type: 'FILE_SELECT', payload: { fileInfo, errors } });

    if (errors.length > 0) return;

    try {
      const result = await validateAndParseCsv(file);
      if (result.success) {
        dispatch({ type: 'PARSE_SUCCESS', payload: result });
      } else {
        dispatch({ type: 'PARSE_ERROR', payload: result });
      }
    } catch (error) {
      const result: CsvParseResult = {
        success: false,
        data: [],
        totalRows: 0,
        previewRows: [],
        errors: [
          {
            type: 'malformed_csv',
            message: error instanceof Error ? error.message : t('csvImport.toast.parseError'),
          },
        ],
        warnings: [],
      };
      dispatch({ type: 'PARSE_ERROR', payload: result });
    }
  };

  const handleSubmit = () => {
    if (state.parseResult?.success && state.fileInfo) {
      importMutation.mutate(state.fileInfo.file);
    } else {
      toast.error(t('csvImport.toast.genericError'));
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  return {
    state,
    isLoading: state.status === 'parsing' || state.status === 'submitting',
    handleFileSelect,
    handleSubmit,
    handleReset,
  };
}
