import { createContext, useContext, type ReactNode, type ComponentType } from 'react';

export interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

interface QuestionConfig {
  ImageUploader: ComponentType<ImageUploaderProps>;
}

const QuestionConfigContext = createContext<QuestionConfig | null>(null);

export function QuestionConfigProvider({
  children,
  imageUploader,
}: {
  children: ReactNode;
  imageUploader: ComponentType<ImageUploaderProps>;
}) {
  return (
    <QuestionConfigContext.Provider value={{ ImageUploader: imageUploader }}>
      {children}
    </QuestionConfigContext.Provider>
  );
}

export function useQuestionConfig(): QuestionConfig {
  const ctx = useContext(QuestionConfigContext);
  if (!ctx) {
    throw new Error('QuestionConfigProvider is required');
  }
  return ctx;
}
