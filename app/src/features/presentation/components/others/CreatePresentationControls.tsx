import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCreateBlankPresentation } from '../../hooks';
import { useTranslation } from 'react-i18next';

const CreatePresentationControls = () => {
  const { t } = useTranslation('presentation', { keyPrefix: 'list' });

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
        <p className="text-lg font-semibold">{t('generateNewPresentation')}</p>
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
        <p className="text-lg font-semibold">{t('createBlankPresentation')}</p>
      </Button>
    </div>
  );
};

export default CreatePresentationControls;
