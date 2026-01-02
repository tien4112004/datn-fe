import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { uploadImage, isValidImageUrl } from '../../utils';
import { Upload, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const ImageUploader = ({
  value,
  onChange,
  label,
  className,
  disabled = false,
}: ImageUploaderProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'shared.imageUploader' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const defaultLabel = t('label');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    try {
      const dataUrl = await uploadImage(file);
      onChange(dataUrl);
    } catch (err: any) {
      setError(err.message || t('uploadError'));
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
      {(label || defaultLabel) && <Label>{label || defaultLabel}</Label>}

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
          {isUploading ? t('uploading') : t('uploadButton')}
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
          <img src={value} alt={t('preview')} className="rounded-md border" style={{ maxHeight: '200px' }} />
        </div>
      )}
    </div>
  );
};
