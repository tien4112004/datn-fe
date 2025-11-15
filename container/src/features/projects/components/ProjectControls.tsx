import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCreateTestPresentations, useCreateBlankPresentation } from '@/features/presentation/hooks';
import { useCreateTestMindmaps } from '@/features/mindmap/hooks';
import { toast } from 'sonner';
import type { ResourceType } from '@/shared/constants/resourceTypes';
import { useTranslation } from 'react-i18next';

interface ProjectControlsProps {
  currentResourceType: ResourceType;
}

const CreatePresentationControls = ({ currentResourceType }: ProjectControlsProps) => {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();

  const createTestPresentations = useCreateTestPresentations();
  const createBlankPresentation = useCreateBlankPresentation();
  const createTestMindmaps = useCreateTestMindmaps();

  const handleCreateBlank = async () => {
    if (currentResourceType === 'presentation') {
      try {
        const result = await createBlankPresentation.mutateAsync();
        navigate(`/presentation/${result.presentation.id}`);
      } catch (error) {
        console.error('Error creating blank presentation:', error);
        toast.error('Failed to create blank presentation');
      }
    } else if (currentResourceType === 'mindmap') {
      toast.info('Mindmap creation coming soon');
    } else {
      toast.error('This resource type is not supported yet');
    }
  };

  const handleCreateTest = async () => {
    if (currentResourceType === 'presentation') {
      try {
        await createTestPresentations.mutateAsync();
        toast.success('Test presentations created successfully');
      } catch (error) {
        console.error('Error creating test presentations:', error);
        toast.error('Failed to create test presentations');
      }
    } else if (currentResourceType === 'mindmap') {
      try {
        await createTestMindmaps.mutateAsync();
        toast.success('Test mindmaps created successfully');
      } catch (error) {
        console.error('Error creating test mindmaps:', error);
        toast.error('Failed to create test mindmaps');
      }
    } else {
      toast.error('This resource type is not supported yet');
    }
  };

  const handleNavigateToCreate = () => {
    navigate(`/${currentResourceType}/create`);
  };

  const showCreationButtons = currentResourceType === 'presentation' || currentResourceType === 'mindmap';

  return (
    <div className="flex space-x-4">
      <Button
        variant={'secondary'}
        className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-blue-500 to-indigo-500 shadow hover:to-blue-500"
        onClick={handleNavigateToCreate}
      >
        <Sparkles className="!size-6" />
        <p className="text-lg font-semibold">{t('controls.generateNew')}</p>
      </Button>

      {showCreationButtons && (
        <Button
          variant={'secondary'}
          className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-green-500 to-teal-500 shadow hover:to-green-500"
          onClick={handleCreateBlank}
        >
          <Plus className="!size-6" />
          <p className="text-lg font-semibold">{t('controls.createBlank')}</p>
        </Button>
      )}

      {showCreationButtons && (
        <Button
          variant={'secondary'}
          className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-purple-500 to-pink-500 shadow hover:to-purple-500"
          onClick={handleCreateTest}
        >
          <p className="text-lg font-semibold">Create Test</p>
          <span className="text-xs opacity-75">(For development only)</span>
        </Button>
      )}
    </div>
  );
};

export default CreatePresentationControls;
