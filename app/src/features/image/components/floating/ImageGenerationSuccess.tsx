import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { SpinnerIcon } from '@/shared/components/common/GlobalSpinner';
import { toast } from 'sonner';
import { useFloatingImageGenerator } from '../../context/FloatingImageGeneratorContext';
import { useNavigate } from 'react-router-dom';
import type { ImageData } from '../../types';

interface ImageGenerationSuccessProps {
  image: ImageData;
  onReset: () => void;
}

/**
 * Success state component that displays generated image and context-aware actions
 * Renders dynamically registered actions (e.g., "Add to Current Question" from AssignmentEditorPage)
 */
export const ImageGenerationSuccess = ({ image, onReset }: ImageGenerationSuccessProps) => {
  const { t } = useTranslation('image');
  const { contextActions } = useFloatingImageGenerator();
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Execute a context action with loading state
   */
  const handleAction = async (actionId: string) => {
    const action = contextActions.find((a) => a.id === actionId);
    if (!action) return;

    setIsExecuting(actionId);
    try {
      await Promise.resolve(action.handler(image.url, image));
      toast.success(t('floating.actionSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('floating.actionError');
      toast.error(errorMessage);
    } finally {
      setIsExecuting(null);
    }
  };

  /**
   * Download the generated image
   */
  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalFilename || 'generated-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t('floating.downloadSuccess'));
    } catch (error) {
      toast.error(t('floating.downloadError'));
    }
  };

  /**
   * Navigate to gallery with the generated image
   */
  const handleViewInGallery = () => {
    navigate('/projects?resource=image', {
      state: { newImage: image, openPreview: true },
    });
  };

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <img src={image.url} alt="Generated" className="aspect-square w-full object-contain" loading="lazy" />
      </div>

      {/* Image Info */}
      {(image.fileSize || image.createdAt) && (
        <div className="space-y-1 px-1 text-xs text-gray-500 dark:text-gray-400">
          {image.fileSize && <div>Size: {(image.fileSize / 1024).toFixed(2)} KB</div>}
          {image.createdAt && (
            <div>
              {new Date(image.createdAt).toLocaleDateString()}{' '}
              {new Date(image.createdAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Context Actions - Dynamic based on current page */}
      {contextActions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {t('floating.quickActions')}
          </Label>
          <div className="flex flex-col gap-2">
            {contextActions.map((action) => {
              const isLoading = isExecuting === action.id;
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={() => handleAction(action.id)}
                  disabled={isExecuting !== null}
                  className="w-full justify-center"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon size={14} />
                      <span className="ml-2 text-xs">{t('floating.loading')}</span>
                    </>
                  ) : (
                    <>
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      <span className="text-sm">{action.label}</span>
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generic Actions */}
      <div className="space-y-2 border-t border-gray-200 pt-2 dark:border-gray-800">
        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {t('floating.moreActions')}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs">
            <Download className="mr-1 h-3.5 w-3.5" />
            {t('floating.download')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewInGallery} className="h-8 text-xs">
            <ImageIcon className="mr-1 h-3.5 w-3.5" />
            {t('floating.viewGallery')}
          </Button>
        </div>
      </div>

      {/* Generate Another */}
      <Button variant="secondary" size="sm" className="w-full text-sm" onClick={onReset}>
        <Sparkles className="mr-2 h-4 w-4" />
        {t('floating.generateAnother')}
      </Button>
    </div>
  );
};
