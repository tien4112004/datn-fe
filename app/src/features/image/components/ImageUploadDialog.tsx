import { useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@ui/dialog';
import { Button } from '@ui/button';
import { useUploadImage } from '../hooks/useApi';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Constants for image validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (imageUrl: string) => void;
}

export const ImageUploadDialog = ({ open, onClose, onSuccess }: ImageUploadDialogProps) => {
  const { t } = useTranslation('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadImage();

  const validateFile = (file: File): string | null => {
    if (file.size === 0) {
      return t('upload.errors.emptyFile');
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return t('upload.errors.fileTooLarge', { size: sizeMB, max: '5' });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return t('upload.errors.invalidType');
    }
    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError('');
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    [t]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMutation.mutate(selectedFile, {
      onSuccess: (cdnUrl) => {
        toast.success(t('upload.success'));
        onSuccess?.(cdnUrl);
        handleClose();
      },
      onError: (error) => {
        toast.error(t('upload.errors.uploadFailed'), {
          description: error.message,
        });
      },
    });
  };

  const handleClose = () => {
    handleRemove();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('upload.title')}</DialogTitle>
          <DialogDescription>{t('upload.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={cn(
              'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              selectedFile && 'border-solid'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              disabled={uploadMutation.isPending}
            />

            {selectedFile && previewUrl ? (
              <div className="relative w-full p-4">
                <img
                  src={previewUrl}
                  alt={t('upload.preview')}
                  className="mx-auto max-h-[200px] rounded-md object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={uploadMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="text-muted-foreground mt-2 text-center text-sm">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <div className="bg-muted rounded-full p-3">
                  <ImageIcon className="text-muted-foreground h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium">{t('upload.dropzone.title')}</p>
                  <p className="text-muted-foreground text-sm">{t('upload.dropzone.subtitle')}</p>
                </div>
                <p className="text-muted-foreground text-xs">{t('upload.dropzone.formats')}</p>
              </div>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
              {t('upload.cancel')}
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('upload.uploading')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('upload.uploadButton')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
