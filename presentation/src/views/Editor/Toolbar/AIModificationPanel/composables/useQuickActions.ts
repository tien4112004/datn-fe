import { FileText, Maximize2, Minimize2, CheckCircle } from 'lucide-vue-next';
import type { Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

export interface QuickAction {
  label: string;
  icon: Component;
  instruction: string;
  operation: string;
}

export function useQuickActions() {
  const { t } = useI18n();

  // Slide-level quick actions
  const slideQuickActions = computed(() => [
    {
      label: t('panels.aiModification.quickActions.slide.shorten'),
      icon: Minimize2,
      instruction: t('panels.aiModification.quickActions.slide.shortenDesc'),
      operation: 'shorten',
    },
    {
      label: t('panels.aiModification.quickActions.slide.expand'),
      icon: Maximize2,
      instruction: t('panels.aiModification.quickActions.slide.expandDesc'),
      operation: 'expand',
    },
    {
      label: t('panels.aiModification.quickActions.slide.fixGrammar'),
      icon: CheckCircle,
      instruction: t('panels.aiModification.quickActions.slide.fixGrammarDesc'),
      operation: 'grammar',
    },
    {
      label: t('panels.aiModification.quickActions.slide.formal'),
      icon: FileText,
      instruction: t('panels.aiModification.quickActions.slide.formalDesc'),
      operation: 'formal',
    },
  ]);

  // Text element quick actions
  const textQuickActions = computed(() => [
    {
      label: t('panels.aiModification.quickActions.textElement.fixGrammar'),
      icon: CheckCircle,
      instruction: t('panels.aiModification.quickActions.textElement.fixGrammarDesc'),
      operation: 'grammar',
    },
    {
      label: t('panels.aiModification.quickActions.textElement.shorten'),
      icon: Minimize2,
      instruction: t('panels.aiModification.quickActions.textElement.shortenDesc'),
      operation: 'shorten',
    },
    {
      label: t('panels.aiModification.quickActions.textElement.expand'),
      icon: Maximize2,
      instruction: t('panels.aiModification.quickActions.textElement.expandDesc'),
      operation: 'expand',
    },
    {
      label: t('panels.aiModification.quickActions.textElement.formal'),
      icon: FileText,
      instruction: t('panels.aiModification.quickActions.textElement.formalDesc'),
      operation: 'formal',
    },
  ]);

  // Combined text quick actions
  const combinedTextQuickActions = computed(() => [
    {
      label: t('panels.aiModification.quickActions.combinedText.expand'),
      icon: Maximize2,
      instruction: t('panels.aiModification.quickActions.combinedText.expandDesc'),
      operation: 'expand',
    },
    {
      label: t('panels.aiModification.quickActions.combinedText.shorten'),
      icon: Minimize2,
      instruction: t('panels.aiModification.quickActions.combinedText.shortenDesc'),
      operation: 'shorten',
    },
    {
      label: t('panels.aiModification.quickActions.combinedText.fixGrammar'),
      icon: CheckCircle,
      instruction: t('panels.aiModification.quickActions.combinedText.fixGrammarDesc'),
      operation: 'grammar',
    },
    {
      label: t('panels.aiModification.quickActions.combinedText.formal'),
      icon: FileText,
      instruction: t('panels.aiModification.quickActions.combinedText.formalDesc'),
      operation: 'formal',
    },
  ]);

  /**
   * Get quick actions based on context type
   */
  function getQuickActions(contextType: 'slide' | 'text' | 'combined-text'): QuickAction[] {
    switch (contextType) {
      case 'slide':
        return slideQuickActions;
      case 'text':
        return textQuickActions;
      case 'combined-text':
        return combinedTextQuickActions;
      default:
        return slideQuickActions;
    }
  }

  return {
    getQuickActions,
    slideQuickActions,
    textQuickActions,
    combinedTextQuickActions,
  };
}
