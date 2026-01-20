import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

// Simple helper to check if URL is valid image
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://');
};

// Convert file to base64 data URL
const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
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
