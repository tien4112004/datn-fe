import { AnimatePresence, motion } from 'motion/react';
import { CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { useExamplePrompts } from '../hooks/useExamplePrompts';
import { type ExamplePromptType } from '../types/examplePrompt';
import { Sparkles, Loader2 } from 'lucide-react';
// We need the * import for dynamic lookup string -> component
import * as LucideIcons from 'lucide-react';

interface ExamplePromptsProps {
  onExampleClick: (example: string) => void;
  isShown: boolean;
  type: ExamplePromptType;
  title?: string;
  // Optional fallback prompts if API fails or for specific overrides
  fallbackPrompts?: string[];
}

const ExamplePrompts = ({
  onExampleClick,
  isShown,
  type,
  title = 'Example Prompts',
  fallbackPrompts = [],
}: ExamplePromptsProps) => {
  const { data: apiPrompts, isLoading } = useExamplePrompts(type);

  const promptsToDisplay =
    apiPrompts && apiPrompts.length > 0
      ? apiPrompts
      : fallbackPrompts.map((p) => ({ id: p, prompt: p, type, icon: undefined }));

  if (!isShown) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="examplePrompts"
        initial={{ opacity: 0, height: 0, y: -20 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -20, delay: 0.1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.4 }}
        style={{ overflow: 'hidden' }}
      >
        <div className="mt-4 flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {isLoading && <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />}
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {promptsToDisplay.map((item, idx) => (
            <Button
              type="button"
              key={item.id || idx}
              variant="prompt"
              className="h-auto w-full justify-start whitespace-normal px-4 py-3 text-left"
              onClick={() => onExampleClick(item.prompt)}
            >
              <div className="bg-primary/10 text-primary mr-3 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <IconWrapper iconName={item.icon} />
              </div>
              <p className="line-clamp-3 text-sm">{item.prompt}</p>
            </Button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const IconWrapper = ({ iconName }: { iconName?: string }) => {
  // Try to find the icon component in LucideIcons
  const IconComponent = iconName ? (LucideIcons as any)[iconName] : null;

  if (!IconComponent) {
    return <Sparkles className="h-4 w-4" />;
  }

  return <IconComponent className="h-5 w-5" />;
};

export default ExamplePrompts;
