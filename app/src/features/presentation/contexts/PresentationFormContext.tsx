import { getLocalStorageData } from '@/shared/lib/utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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
import { useImageApiService } from '@/features/image/api';
import { toast } from 'sonner';
import type { AttachedFile } from '@/shared/components/FileAttachmentInput';
import { MAX_FILE_SIZE } from '@/shared/components/FileAttachmentInput';
import { t } from 'i18next';

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
  // Image generation fields (optional)
  negativePrompt?: string;
  // Metadata fields (optional)
  grade?: string;
  subject?: string;
};

interface PresentationFormContextValue {
  control: Control<UnifiedFormData>;
  watch: UseFormWatch<UnifiedFormData>;
  setValue: UseFormSetValue<UnifiedFormData>;
  trigger: UseFormTrigger<UnifiedFormData>;
  getValues: UseFormGetValues<UnifiedFormData>;
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  isUploadingFiles: boolean;
  uploadFiles: (files: FileList) => Promise<void>;
}

const PresentationFormContext = createContext<PresentationFormContextValue | null>(null);

interface PresentationFormProviderProps {
  children: ReactNode;
}

const PRESENTATION_FORM_KEY = 'presentation-unified-form';

export const PresentationFormProvider = ({ children }: PresentationFormProviderProps) => {
  const persistedData = useMemo(() => getLocalStorageData(PRESENTATION_FORM_KEY), []);
  const imageApiService = useImageApiService();

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList) => {
      const allFiles = Array.from(files);
      const oversized = allFiles.filter((f) => f.size > MAX_FILE_SIZE);
      const valid = allFiles.filter((f) => f.size <= MAX_FILE_SIZE);

      oversized.forEach((f) =>
        toast.error(t('presentation:createOutline.fileUpload.fileTooLarge', { name: f.name }))
      );

      if (valid.length === 0) return;

      setIsUploadingFiles(true);
      try {
        const uploads = valid.map(async (file) => {
          const cdnUrl = await imageApiService.uploadImage(file);
          return { name: file.name, url: cdnUrl, size: file.size };
        });
        const results = await Promise.all(uploads);
        setAttachedFiles((prev) => [...prev, ...results]);
      } catch {
        toast.error(t('presentation:createOutline.fileUpload.uploadError'));
      } finally {
        setIsUploadingFiles(false);
      }
    },
    [imageApiService]
  );

  // Zod validation schema for presentation form
  const presentationFormSchema = useMemo(
    () =>
      z.object({
        // Outline fields - topic optional when files are attached
        topic: z.string(),
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
            id: z.string(),
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
        negativePrompt: z.string().optional(),
        grade: z.string().max(50).optional(),
        subject: z.string().max(100).optional(),
      }),
    []
  );

  const form = useForm<UnifiedFormData>({
    resolver: zodResolver(presentationFormSchema),
    defaultValues: {
      topic: '',
      slideCount: 10,
      language: 'vi',
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
      negativePrompt: '',
      grade: '',
      subject: '',
      ...persistedData,
    },
  });

  // Persist form data
  useFormPersist(PRESENTATION_FORM_KEY, {
    watch: form.watch,
    setValue: form.setValue,
    storage: window.localStorage,
    exclude: ['negativePrompt'],
  });

  useEffect(() => {
    moduleMap.editor();
    moduleMap.thumbnail();
  }, []);

  const contextValue = useMemo<PresentationFormContextValue>(
    () => ({
      control: form.control,
      watch: form.watch,
      setValue: form.setValue,
      trigger: form.trigger,
      getValues: form.getValues,
      attachedFiles,
      setAttachedFiles,
      isUploadingFiles,
      uploadFiles,
    }),
    [
      form.control,
      form.watch,
      form.setValue,
      form.trigger,
      form.getValues,
      attachedFiles,
      isUploadingFiles,
      uploadFiles,
    ]
  );

  return <PresentationFormContext.Provider value={contextValue}>{children}</PresentationFormContext.Provider>;
};

export const usePresentationForm = (): PresentationFormContextValue => {
  const context = useContext(PresentationFormContext);
  if (!context) {
    throw new Error('usePresentationForm must be used within a PresentationFormProvider');
  }
  return context;
};
