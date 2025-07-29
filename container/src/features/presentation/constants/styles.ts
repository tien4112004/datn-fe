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
