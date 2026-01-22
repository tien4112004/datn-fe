import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useClassFeedApiService } from '../api';
import { validateAttachment, type ValidationResult } from '../utils/attachmentValidation';

interface PendingFile {
  file: File;
  id: string;
}

interface UseAttachmentUploadReturn {
  uploadedUrls: string[];
  pendingFiles: PendingFile[];
  isUploading: boolean;
  uploadProgress: number;
  addFiles: (files: File[]) => ValidationResult[];
  removeFile: (index: number) => void;
  removePendingFile: (id: string) => void;
  uploadAll: () => Promise<string[]>;
  clear: () => void;
  setUploadedUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * Hook for managing attachment uploads with validation and progress tracking
 */
export function useAttachmentUpload(): UseAttachmentUploadReturn {
  const classFeedApi = useClassFeedApiService();
  const { t } = useTranslation('classes', { keyPrefix: 'feed.creator.attachments' });

  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Add files to the pending list after validation
   * Returns validation results for each file
   */
  const addFiles = useCallback((files: File[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const validFiles: PendingFile[] = [];

    for (const file of files) {
      const validation = validateAttachment(file);
      results.push(validation);

      if (validation.valid) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      }
    }

    if (validFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...validFiles]);
    }

    return results;
  }, []);

  /**
   * Remove an uploaded URL by index
   */
  const removeFile = useCallback((index: number) => {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Remove a pending file by id
   */
  const removePendingFile = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((pf) => pf.id !== id));
  }, []);

  /**
   * Upload all pending files and return their CDN URLs
   */
  const uploadAll = useCallback(async (): Promise<string[]> => {
    if (pendingFiles.length === 0) {
      return uploadedUrls;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const newUrls: string[] = [];
    const totalFiles = pendingFiles.length;

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const { file } = pendingFiles[i];

        try {
          const cdnUrl = await classFeedApi.uploadAttachment(file);
          newUrls.push(cdnUrl);
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(t('upload.failed', { fileName: file.name }), {
            description: error instanceof Error ? error.message : t('upload.failedDescription'),
          });
          throw error;
        }
      }

      const allUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(allUrls);
      setPendingFiles([]);

      return allUrls;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [pendingFiles, uploadedUrls, classFeedApi]);

  /**
   * Clear all pending files and uploaded URLs
   */
  const clear = useCallback(() => {
    setPendingFiles([]);
    setUploadedUrls([]);
    setUploadProgress(0);
  }, []);

  return {
    uploadedUrls,
    pendingFiles,
    isUploading,
    uploadProgress,
    addFiles,
    removeFile,
    removePendingFile,
    uploadAll,
    clear,
    setUploadedUrls,
  };
}
