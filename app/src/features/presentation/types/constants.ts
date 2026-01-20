export const SLIDE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 36];

export interface LanguageOption {
  value: string;
  labelKey: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', labelKey: 'language.english' },
  { value: 'vi', labelKey: 'language.vietnamese' },
];

export const MODEL_PROVIDERS_LOGO: Record<string, string> = {
  OpenAI: '/images/providers/openai.png',
  Deepseek: '/images/providers/deepseek.png',
  Google: '/images/providers/google.png',
  LocalAI: '/images/providers/localai.png',
  openRouter: '/images/providers/openrouter.png',
};

export const PRESENTATION_VIEW_STATE = {
  OUTLINE_CREATION: 'outline_creation',
  WORKSPACE: 'workspace',
} as const;

export type PresentationViewState = (typeof PRESENTATION_VIEW_STATE)[keyof typeof PRESENTATION_VIEW_STATE];
