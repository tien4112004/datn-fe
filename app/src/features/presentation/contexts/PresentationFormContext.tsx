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
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useFormPersist from 'react-hook-form-persist';
import { moduleMap } from '../components/remote/module';
import type { SlideTheme } from '../types/slide';
import type { ArtStyle } from '@aiprimary/core';

export type UnifiedFormData = {
  // Outline fields
  topic: string;
  slideCount: number;
  language: string;
  model: {
    name: string;
    provider: string;
  };
  // Customization fields (optional)
  theme?: SlideTheme;
  contentLength?: string;
  artStyle?: ArtStyle;
  imageModel?: {
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

  // Zod validation schema for presentation form
  const presentationFormSchema = useMemo(
    () =>
      z.object({
        // Outline fields - required
        topic: z.string().min(1),
        slideCount: z.number().min(1),
        language: z.string().min(1),
        model: z.object({
          name: z.string().min(1),
          provider: z.string().min(1),
        }),

        // Customization fields - optional
        theme: z.any().optional(),
        contentLength: z.string().optional(),
        artStyle: z
          .object({
            id: z.string().optional(),
            name: z.string(),
            labelKey: z.string(),
            visual: z.string().optional(),
            modifiers: z.string().optional(),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
          })
          .optional(),
        imageModel: z
          .object({
            name: z.string().min(1),
            provider: z.string().min(1),
          })
          .optional(),
      }),
    []
  );

  const form = useForm<UnifiedFormData>({
    resolver: zodResolver(presentationFormSchema),
    defaultValues: {
      topic: '',
      slideCount: 10,
      language: 'en',
      model: {
        name: '',
        provider: '',
      },
      theme: undefined,
      contentLength: '',
      artStyle: undefined,
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
