import { AnimatePresence, motion } from 'motion/react';
import { CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExamplePromptsProps {
  onExampleClick: (example: string) => void;
  isShown: boolean;
  prompts: string[];
  title?: string;
}

const ExamplePrompts = ({
  onExampleClick,
  isShown,
  prompts,
  title = 'Example Prompts',
}: ExamplePromptsProps) => {
  return (
    <AnimatePresence>
      {isShown && (
        <motion.div
          key="examplePrompts"
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20, delay: 0.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.4 }}
          style={{ overflow: 'hidden' }}
        >
          <CardTitle className="mt-4">{title}</CardTitle>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {prompts.map((prompt, idx) => (
              <Button
                type="button"
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
