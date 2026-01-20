import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCreateBlankPresentation } from '@/features/presentation/hooks';
import { useCreateBlankMindmap } from '@/features/mindmap/hooks';
import { toast } from 'sonner';
import type { ResourceType } from '@/shared/constants/resourceTypes';
import { useTranslation } from 'react-i18next';

interface ProjectControlsProps {
  currentResourceType: ResourceType;
}

// Type guard for supported resource types
const isSupportedResourceType = (type: ResourceType): type is 'presentation' | 'mindmap' | 'assignment' => {
  return type === 'presentation' || type === 'mindmap' || type === 'assignment';
};

// Resource-specific hook configuration
const useResourceHooks = (resourceType: ResourceType) => {
  const navigate = useNavigate();

  const createBlankPresentation = useCreateBlankPresentation();
  const createBlankMindmap = useCreateBlankMindmap();

  if (resourceType === 'presentation') {
    return {
      generate: () => navigate('/presentation/generate'),
      createBlank: () =>
        createBlankPresentation.mutate(undefined, {
          onSuccess: (data) => {
            navigate(`/presentation/${data.presentation.id}`);
          },
          onError: (error: any) => {
            toast.error(`Failed to create presentation: ${error?.message || 'Unknown error'}`);
          },
        }),
    };
  } else if (resourceType === 'mindmap') {
    return {
      generate: () => navigate('/mindmap/generate'),
      createBlank: () =>
        createBlankMindmap.mutate(undefined, {
          onSuccess: (data) => {
            navigate(`/mindmap/${data.mindmap.id}`);
          },
          onError: (error: any) => {
            toast.error(`Failed to create mindmap: ${error?.message || 'Unknown error'}`);
          },
        }),
    };
  } else if (resourceType === 'assignment') {
    return {
      generate: null, // Assignments don't have AI generation yet
      createBlank: () => navigate('/assignments/create'),
    };
  } else if (resourceType === 'image') {
    return {
      generate: () => navigate('/image/generate'),
      createBlank: null,
    };
  }

  return null;
};

const CreatePresentationControls = ({ currentResourceType }: ProjectControlsProps) => {
  const { t } = useTranslation('projects');
  const hooks = useResourceHooks(currentResourceType);

  const handleCreateBlank = () => {
    if (hooks?.createBlank) {
      hooks.createBlank();
    }
  };

  const handleGenerate = () => {
    hooks?.generate?.();
  };

  const showCreationButtons = isSupportedResourceType(currentResourceType);
  const showGenerateButton = hooks?.generate;

  return (
    <div className="flex space-x-4">
      {showGenerateButton && (
        <Button
          variant="secondary"
          className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-blue-500 to-indigo-500 shadow hover:to-blue-500"
          onClick={handleGenerate}
        >
          <Sparkles className="!size-6" />
          <p className="text-lg font-semibold">{t('controls.generateNew')}</p>
        </Button>
      )}

      {showCreationButtons && hooks?.createBlank && (
        <Button
          variant="secondary"
          className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-green-500 to-teal-500 shadow hover:to-green-500"
          onClick={handleCreateBlank}
        >
          <Plus className="!size-6" />
          <p className="text-lg font-semibold">{t('controls.createBlank')}</p>
        </Button>
      )}
    </div>
  );
};

export default CreatePresentationControls;
