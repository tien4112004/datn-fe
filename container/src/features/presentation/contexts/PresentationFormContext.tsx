import { getLocalStorageData } from '@/shared/lib/utils';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import {
  useForm,
  type Control,
  type UseFormWatch,
  type UseFormSetValue,
  type UseFormTrigger,
  type UseFormGetValues,
} from 'react-hook-form';
import useFormPersist from 'react-hook-form-persist';
import { moduleMap, moduleMethodMap } from '../components/remote/module';
import type { SlideTheme } from '../types/slide';

export type UnifiedFormData = {
  // Outline fields
  topic: string;
  slideCount: number;
  language: string;
  model: {
    name: string;
    provider: string;
  };
  // Customization fields
  theme: SlideTheme;
  contentLength: string;
  imageModel: {
    name: string;
    provider: string;
  };
};

interface PresentationFormContextValue {
  control: Control<UnifiedFormData>;
  watch: UseFormWatch<UnifiedFormData>;
  setValue: UseFormSetValue<UnifiedFormData>;
  trigger: UseFormTrigger<UnifiedFormData>;
  getValues: UseFormGetValues<UnifiedFormData>;
}

const PresentationFormContext = createContext<PresentationFormContextValue | null>(null);

interface PresentationFormProviderProps {
  children: ReactNode;
}

const PRESENTATION_FORM_KEY = 'presentation-unified-form';

export const PresentationFormProvider = ({ children }: PresentationFormProviderProps) => {
  const persistedData = useMemo(() => getLocalStorageData(PRESENTATION_FORM_KEY), []);

  const form = useForm<UnifiedFormData>({
    defaultValues: {
      topic: '',
      slideCount: 10,
      language: 'en',
      model: {
        name: '',
        provider: '',
      },
      theme: {
        id: 'classic',
      },
      contentLength: '',
      imageModel: {
        name: '',
        provider: '',
      },
      ...persistedData,
    },
  });

  // Persist form data
  useFormPersist(PRESENTATION_FORM_KEY, {
    watch: form.watch,
    setValue: form.setValue,
    storage: window.localStorage,
    exclude: [],
  });

  useEffect(() => {
    moduleMap.editor();
    moduleMap.thumbnail();
    moduleMethodMap.method();
  }, []);

  const contextValue: PresentationFormContextValue = {
    control: form.control,
    watch: form.watch,
    setValue: form.setValue,
    trigger: form.trigger,
    getValues: form.getValues,
  };

  return <PresentationFormContext.Provider value={contextValue}>{children}</PresentationFormContext.Provider>;
};

export const usePresentationForm = (): PresentationFormContextValue => {
  const context = useContext(PresentationFormContext);
  if (!context) {
    throw new Error('usePresentationForm must be used within a PresentationFormProvider');
  }
  return context;
};
