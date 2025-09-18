import { getLocalStorageData } from '@/shared/lib/utils';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  useForm,
  type Control,
  type UseFormWatch,
  type UseFormSetValue,
  type UseFormTrigger,
  type UseFormGetValues,
} from 'react-hook-form';
import useFormPersist from 'react-hook-form-persist';
import { PRESENTATION_VIEW_STATE, type PresentationViewState } from '../types';

export type UnifiedFormData = {
  // Outline fields
  topic: string;
  slideCount: number;
  language: string;
  model: string;
  targetAge: string;
  learningObjective: string;
  // Customization fields
  theme: string;
  contentLength: string;
  imageModel: string;
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
  currentView?: PresentationViewState;
  defaultValues?: Partial<UnifiedFormData>;
}

const PRESENTATION_FORM_KEY = 'presentation-unified-form';

export const PresentationFormProvider = ({
  children,
  defaultValues = {},
  currentView,
}: PresentationFormProviderProps) => {
  const persistedData = useMemo(() => getLocalStorageData(PRESENTATION_FORM_KEY), []);

  const form = useForm<UnifiedFormData>({
    defaultValues: {
      topic: '',
      slideCount: 10,
      language: 'en',
      model: '',
      targetAge: '7-10',
      learningObjective: 'Help student understand the topic',
      theme: '',
      contentLength: '',
      imageModel: '',
      ...defaultValues,
      ...persistedData,
    },
  });

  // Persist form data
  useFormPersist(PRESENTATION_FORM_KEY, {
    watch: form.watch,
    setValue: form.setValue,
    storage: window.localStorage,
    exclude: currentView === PRESENTATION_VIEW_STATE.WORKSPACE ? ['topic'] : [],
  });

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
