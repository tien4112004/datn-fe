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
