import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMindmapPermissionContext } from '../../contexts/MindmapPermissionContext';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { useUpdateMindmapTitle } from '../../hooks/useApi';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { toast } from 'sonner';
import { Check, Pencil, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MindmapBreadcrumbHeaderProps {
  mindmapId: string;
  initialTitle: string;
}

const MindmapBreadcrumbHeader = memo(({ mindmapId, initialTitle }: MindmapBreadcrumbHeaderProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.MINDMAP);
  const navigate = useNavigate();
  const { canEdit } = useMindmapPermissionContext();
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
    // Prevent save if user can't edit
    if (!canEdit) {
      setIsEditing(false);
      return;
    }

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
      toast.success(t('title.updateSuccess'));
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error(error instanceof Error ? error.message : t('title.updateError'));
      setTitle(originalTitle);
      setIsEditing(false);
    }
  }, [title, originalTitle, mindmapId, updateMindmapTitle, t, canEdit]);

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

  const handleNavigateToMindmaps = useCallback(() => {
    navigate('/projects?resource=mindmap');
  }, [navigate]);

  return (
    <div className="absolute left-4 top-4 z-10 max-w-md rounded-lg border bg-white/95 px-4 py-3 shadow-md backdrop-blur-sm">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <button onClick={handleNavigateToMindmaps} className="cursor-pointer">
                Mindmaps
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="border-primary h-7 w-32 bg-transparent px-2 text-sm font-medium shadow-none focus-visible:ring-0 sm:w-48"
                  disabled={updateMindmapTitle.isPending}
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={handleSave}
                    disabled={updateMindmapTitle.isPending}
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    onClick={handleCancel}
                    disabled={updateMindmapTitle.isPending}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BreadcrumbPage className={cn('max-w-32 truncate sm:max-w-48')}>{title}</BreadcrumbPage>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil size={14} />
                  </Button>
                )}
              </div>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
});

export default MindmapBreadcrumbHeader;
