import { useRef, useState } from 'react';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, getBackendUrl } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith('data:image/')) return !url.startsWith('data:image/svg');
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return ALLOWED_EXTENSIONS.test(parsed.pathname);
  } catch {
    return false;
  }
};

const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

const uploadImage = async (file: File): Promise<string> => {
  if (file.size === 0) throw new Error('File is empty');
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size (${sizeMB} MB) exceeds the maximum allowed size of 5 MB`);
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)');

  const objectUrl = URL.createObjectURL(file);
  try {
    const dimensions = await getImageDimensions(objectUrl);
    if (dimensions.width > MAX_DIMENSIONS.width || dimensions.height > MAX_DIMENSIONS.height) {
      throw new Error(
        `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed (${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height})`
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<
      ApiResponse<{ cdnUrl: string; mediaType: string; extension: string; id: number }>
    >(`${getBackendUrl()}/api/media/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.cdnUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const ImageUploader = ({
  value,
  onChange,
  label = 'Image',
  className,
  disabled = false,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    try {
      const dataUrl = await uploadImage(file);
      onChange(dataUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>

        {value && isValidImageUrl(value) && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={disabled}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {value && isValidImageUrl(value) && (
        <div className="relative mt-2 inline-block max-w-xs">
          <img src={value} alt="Preview" className="rounded-md border" style={{ maxHeight: '200px' }} />
        </div>
      )}
    </div>
  );
};
