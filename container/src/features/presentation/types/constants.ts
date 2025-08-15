export interface StyleOption {
  value: string;
  labelKey: string;
}

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the updated outline form component instead.
 */
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
  { value: 'en', labelKey: 'language.english' },
  { value: 'vi', labelKey: 'language.vietnamese' },
];

export interface TargetAgeOption {
  value: string;
  labelKey: string;
}

export const TARGET_AGE_OPTIONS: TargetAgeOption[] = [
  { value: '3-5', labelKey: 'targetAge.preschool' },
  { value: '5-7', labelKey: 'targetAge.earlyElementary' },
  { value: '7-10', labelKey: 'targetAge.elementary' },
  { value: '10-13', labelKey: 'targetAge.middleSchool' },
  { value: '13-16', labelKey: 'targetAge.highSchool' },
  { value: '16-18', labelKey: 'targetAge.seniorHigh' },
  { value: '18+', labelKey: 'targetAge.adult' },
];
