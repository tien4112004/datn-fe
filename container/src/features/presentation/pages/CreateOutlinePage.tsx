import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import OutlineForm from '../components/OutlineForm';

const CreateOutlinePage = () => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const [promptInput, setPromptInput] = React.useState('');
  const [slideCount, setSlideCount] = React.useState<string | undefined>('10');
  const [style, setStyle] = React.useState<string | undefined>(undefined);
  const [model, setModel] = React.useState<string>('gpt-4o-mini');

  const handleSubmit = () => {
    // TODO: Implement the actual API call to generate the outline
    toast('Data:', {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">
            {JSON.stringify(
              {
                prompt: promptInput,
                slideCount,
                style,
                model,
              },
              null,
              2
            )}
          </code>
        </pre>
      ),
    });
  };

  return (
    <>
      <SidebarTrigger className="absolute left-4 top-4 z-50" />
      <div className="lg:w-4xl flex h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 self-center sm:w-full">
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
        <Button onClick={handleSubmit}>{t('generateOutline')}</Button>
      </div>
    </>
  );
};

export default CreateOutlinePage;
