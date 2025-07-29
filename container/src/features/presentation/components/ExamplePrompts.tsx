import { AnimatePresence, motion } from 'framer-motion';
import { CardTitle } from '@/shared/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const ExamplePrompts = ({
  onExampleClick,
  promptInput,
}: {
  onExampleClick: (example: string) => void;
  promptInput: string;
}) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const examplePrompts = [
    t('examplePrompt1'),
    t('examplePrompt2'),
    t('examplePrompt3'),
    t('examplePrompt4'),
    t('examplePrompt5'),
    t('examplePrompt6'),
  ];

  return (
    <AnimatePresence>
      {promptInput.trim() === '' && (
        <motion.div
          key="examplePrompts"
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.4 }}
          style={{ overflow: 'hidden' }}
        >
          <CardTitle className="mt-4">{t('examplePromptTitle')}</CardTitle>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {examplePrompts.map((prompt, idx) => (
              <Button
                key={'prompt' + idx}
                variant="prompt"
                className="h-auto w-full whitespace-normal px-4 py-2 text-left"
                onClick={() => onExampleClick(prompt)}
              >
                <p className="text-sm">{prompt}</p>
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExamplePrompts;
