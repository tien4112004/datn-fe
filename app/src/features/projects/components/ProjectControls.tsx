import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCreateTestPresentations, useCreateBlankPresentation } from '@/features/presentation/hooks';
import { useCreateBlankMindmap, useCreateTestMindmaps } from '@/features/mindmap/hooks';
import { toast } from 'sonner';
import type { ResourceType } from '@/shared/constants/resourceTypes';
import { useTranslation } from 'react-i18next';

interface ProjectControlsProps {
  currentResourceType: ResourceType;
}

// Type guard for supported resource types
const isSupportedResourceType = (type: ResourceType): type is 'presentation' | 'mindmap' => {
  return type === 'presentation' || type === 'mindmap';
};

// Resource-specific hook configuration
const useResourceHooks = (resourceType: ResourceType, t: ReturnType<typeof useTranslation>['t']) => {
  const navigate = useNavigate();

  const createTestPresentations = useCreateTestPresentations();
  const createBlankPresentation = useCreateBlankPresentation();
  const createTestMindmaps = useCreateTestMindmaps();
  const createBlankMindmap = useCreateBlankMindmap();

  if (resourceType === 'presentation') {
    return {
      generate: () => navigate('/presentation/generate'),
      createBlank: () =>
        createBlankPresentation.mutate(undefined, {
          onSuccess: (data) => {
            navigate(`/presentation/${data.presentation.id}`);
          },
          onError: (error) => {
            toast.error(t('creation.createPresentationError', { error: error.message }));
          },
        }),
      createTest: () => createTestPresentations.mutate(),
    };
  } else if (resourceType === 'mindmap') {
    return {
      generate: () => navigate('/mindmap/generate'),
      createBlank: () =>
        createBlankMindmap.mutate(undefined, {
          onSuccess: (data) => {
            navigate(`/mindmap/${data.mindmap.id}`);
          },
          onError: (error) => {
            toast.error(t('creation.createMindmapError', { error: error.message }));
          },
        }),
      createTest: () => createTestMindmaps.mutate(),
    };
  } else if (resourceType === 'image') {
    return {
      generate: () => navigate('/image/generate'),
      createBlank: null,
      createTest: null,
    };
  }

  return null;
};

const CreatePresentationControls = ({ currentResourceType }: ProjectControlsProps) => {
  const { t } = useTranslation('projects');
  const hooks = useResourceHooks(currentResourceType, t);

  const handleCreateBlank = () => {
    if (hooks?.createBlank) {
      hooks.createBlank();
    }
  };

  const handleCreateTest = () => {
    if (hooks?.createTest) {
      hooks.createTest();
    }
  };

  const handleGenerate = () => {
    hooks?.generate();
  };

  const showCreationButtons = isSupportedResourceType(currentResourceType);

  return (
    <div className="flex space-x-4">
      <Button
        variant="secondary"
        className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-blue-500 to-indigo-500 shadow hover:to-blue-500"
        onClick={handleGenerate}
      >
        <Sparkles className="!size-6" />
        <p className="text-lg font-semibold">{t('controls.generateNew')}</p>
      </Button>

      {showCreationButtons && (
        <>
          <Button
            variant="secondary"
            className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-green-500 to-teal-500 shadow hover:to-green-500"
            onClick={handleCreateBlank}
          >
            <Plus className="!size-6" />
            <p className="text-lg font-semibold">{t('controls.createBlank')}</p>
          </Button>

          <Button
            variant="secondary"
            className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-purple-500 to-pink-500 shadow hover:to-purple-500"
            onClick={handleCreateTest}
          >
            <p className="text-lg font-semibold">Create Test</p>
            <span className="text-xs opacity-75">(For development only)</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default CreatePresentationControls;
