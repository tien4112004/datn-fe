import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import OutlineForm from './OutlineForm';
import type { ModelOption } from '@/features/model';

interface OutlineCreationViewProps {
  defaultModel: ModelOption;
  onCreateOutline: (outlineData: {
    prompt: string;
    slideCount: string | undefined;
    style: string | undefined;
    model: string;
  }) => void;
}

const OutlineCreationView = ({ defaultModel, onCreateOutline }: OutlineCreationViewProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });

  // Local state for outline creation form
  const [promptInput, setPromptInput] = useState('');
  const [slideCount, setSlideCount] = useState<string | undefined>('10');
  const [style, setStyle] = useState<string | undefined>(undefined);
  const [model, setModel] = useState<string>(defaultModel.name);

  const handleCreateOutline = () => {
    onCreateOutline({
      prompt: promptInput,
      slideCount,
      style,
      model,
    });
  };

  return (
    <div className="lg:w-4xl flex min-h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 self-center sm:w-full">
      <h1 className="text-3xl font-bold leading-10 text-neutral-900">{t('title')}</h1>
      <h2 className="text-xl font-bold leading-10 text-sky-500/80">{t('subtitle')}</h2>

      <OutlineForm
        promptInput={promptInput}
        setPromptInput={setPromptInput}
        slideCount={slideCount}
        setSlideCount={setSlideCount}
        style={style}
        setStyle={setStyle}
        model={model}
        setModel={setModel}
      />
      <Button onClick={handleCreateOutline}>{t('generateOutline')}</Button>
    </div>
  );
};

export default OutlineCreationView;
