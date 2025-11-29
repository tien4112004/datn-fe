import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/shared/components/ui/input';
import { useUpdateMindmapTitle } from '../../hooks/useApi';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { toast } from 'sonner';
import { Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface MindmapTitleInputProps {
  mindmapId: string;
  initialTitle: string;
}

const MindmapTitleInput = ({ mindmapId, initialTitle }: MindmapTitleInputProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMindmapTitle = useUpdateMindmapTitle();

  // Sync with initial title from loader
  useEffect(() => {
    setTitle(initialTitle);
    setOriginalTitle(initialTitle);
  }, [initialTitle]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitle(originalTitle);
      setIsEditing(false);
      return;
    }

    if (trimmedTitle === originalTitle) {
      setIsEditing(false);
      return;
    }

    try {
      await updateMindmapTitle.mutateAsync({
        id: mindmapId,
        name: trimmedTitle,
      });
      setOriginalTitle(trimmedTitle);
      setIsEditing(false);
      toast.success(t('title.updateSuccess', 'Title updated successfully'));
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error(error instanceof Error ? error.message : t('title.updateError', 'Failed to update title'));
      setTitle(originalTitle);
      setIsEditing(false);
    }
  }, [title, originalTitle, mindmapId, updateMindmapTitle, t]);

  const handleCancel = useCallback(() => {
    setTitle(originalTitle);
    setIsEditing(false);
  }, [originalTitle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const handleBlur = useCallback(() => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 150);
  }, [isEditing, handleSave]);

  return (
    <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm transition-all',
          isEditing ? 'border-primary ring-primary/20 ring-2' : 'border-gray-200 hover:border-gray-300'
        )}
      >
        {isEditing ? (
          <>
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="h-7 w-48 border-0 bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0"
              placeholder={t('title.placeholder', 'Enter mindmap title')}
              disabled={updateMindmapTitle.isPending}
            />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={handleSave}
                disabled={updateMindmapTitle.isPending}
                title={t('title.save', 'Save')}
              >
                <Check size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                onClick={handleCancel}
                disabled={updateMindmapTitle.isPending}
                title={t('title.cancel', 'Cancel')}
              >
                <X size={14} />
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="max-w-48 truncate text-sm font-medium text-gray-800">{title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              onClick={() => setIsEditing(true)}
              title={t('title.edit', 'Edit title')}
            >
              <Pencil size={14} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MindmapTitleInput;
