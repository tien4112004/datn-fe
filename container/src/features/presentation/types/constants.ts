export interface StyleOption {
  value: string;
  labelKey: string;
}

export const PRESENTATION_STYLES: StyleOption[] = [
  { value: 'business', labelKey: 'styleBusiness' },
  { value: 'education', labelKey: 'styleEducation' },
  { value: 'creative', labelKey: 'styleCreative' },
  { value: 'minimal', labelKey: 'styleMinimal' },
];

export const SLIDE_COUNT_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 36];

export interface LanguageOption {
  value: string;
  labelKey: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', labelKey: 'languageEnglish' },
  { value: 'vi', labelKey: 'languageVietnamese' },
];

export interface TargetAgeOption {
  value: string;
  labelKey: string;
}

export const TARGET_AGE_OPTIONS: TargetAgeOption[] = [
  { value: '3-5', labelKey: 'targetAgePreschool' },
  { value: '5-7', labelKey: 'targetAgeEarlyElementary' },
  { value: '7-10', labelKey: 'targetAgeElementary' },
  { value: '10-13', labelKey: 'targetAgeMiddleSchool' },
  { value: '13-16', labelKey: 'targetAgeHighSchool' },
  { value: '16-18', labelKey: 'targetAgeSeniorHigh' },
  { value: '18+', labelKey: 'targetAgeAdult' },
];
