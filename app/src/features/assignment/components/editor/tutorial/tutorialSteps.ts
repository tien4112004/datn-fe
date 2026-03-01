export type TutorialPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TutorialStep {
  target: string;
  i18nKey: string;
  placement: TutorialPlacement;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { target: 'nav-toolbar', i18nKey: 'toolbar', placement: 'bottom' },
  { target: 'nav-info', i18nKey: 'infoIcon', placement: 'bottom' },
  { target: 'nav-matrix', i18nKey: 'matrixIcon', placement: 'bottom' },
  { target: 'nav-contexts', i18nKey: 'contextsIcon', placement: 'bottom' },
  { target: 'nav-questions-list', i18nKey: 'questionsListIcon', placement: 'bottom' },
  { target: 'nav-grid', i18nKey: 'questionsGrid', placement: 'left' },
  { target: 'nav-question-item', i18nKey: 'questionItem', placement: 'bottom' },
  { target: 'nav-context-group', i18nKey: 'contextGroup', placement: 'bottom' },
];
