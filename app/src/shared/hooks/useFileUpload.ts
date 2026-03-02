import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useImageApiService } from '@/features/image/api';
import { type AttachedFile, MAX_FILE_SIZE } from '@/shared/components/FileAttachmentInput';

interface UseFileUploadOptions {
  totalSizeTooLargeMessage: string;
  uploadErrorMessage: string;
}

export function useFileUpload({ totalSizeTooLargeMessage, uploadErrorMessage }: UseFileUploadOptions) {
  const imageApiService = useImageApiService();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList) => {
      const allFiles = Array.from(files);
      const currentTotal = attachedFiles.reduce((sum, f) => sum + f.size, 0);
      const newTotal = allFiles.reduce((sum, f) => sum + f.size, 0);

      if (currentTotal + newTotal > MAX_FILE_SIZE) {
        toast.error(totalSizeTooLargeMessage);
        return;
      }

      setIsUploadingFiles(true);
      try {
        const uploads = allFiles.map(async (file) => {
          const cdnUrl = await imageApiService.uploadImage(file);
          return { name: file.name, url: cdnUrl, size: file.size };
        });
        const results = await Promise.all(uploads);
        setAttachedFiles((prev) => [...prev, ...results]);
      } catch {
        toast.error(uploadErrorMessage);
      } finally {
        setIsUploadingFiles(false);
      }
    },
    [imageApiService, attachedFiles, totalSizeTooLargeMessage, uploadErrorMessage]
  );

  return { attachedFiles, setAttachedFiles, isUploadingFiles, uploadFiles };
}
