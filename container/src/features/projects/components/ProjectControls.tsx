import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCreateTestPresentations, useCreateBlankPresentation } from '@/features/presentation/hooks';
import { useTranslation } from 'react-i18next';

const CreatePresentationControls = () => {
  const { t } = useTranslation('projects');

  const createTestPresentations = useCreateTestPresentations();
  const createBlankPresentation = useCreateBlankPresentation();
  const navigate = useNavigate();

  return (
    <div className="flex space-x-4">
      <Button
        variant={'secondary'}
        className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-blue-500 to-indigo-500 shadow hover:to-blue-500"
        onClick={() => navigate('/presentation/create')}
      >
        <Sparkles className="!size-6" />
        <p className="text-lg font-semibold">{t('controls.generateNew')}</p>
      </Button>

      <Button
        variant={'secondary'}
        className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-green-500 to-teal-500 shadow hover:to-green-500"
        onClick={() =>
          createBlankPresentation
            .mutateAsync()
            .then((res) => navigate(`/presentation/${res.presentation.id}`))
        }
      >
        <Plus className="!size-6" />
        <p className="text-lg font-semibold">{t('controls.createBlank')}</p>
      </Button>

      <Button
        variant={'secondary'}
        className="text-primary-foreground dark:text-foreground flex h-28 flex-col bg-gradient-to-r from-purple-500 to-pink-500 shadow hover:to-purple-500"
        onClick={() => createTestPresentations.mutateAsync()}
      >
        <p className="text-lg font-semibold">Create Test Presentation</p>
        <span className="text-xs opacity-75">(For development only)</span>
      </Button>
    </div>
  );
};

export default CreatePresentationControls;
