import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { QuickAction } from '../../types/aiModification';

export function useMindmapQuickActions(): QuickAction[] {
  const { t } = useTranslation('mindmap');

  return useMemo(
    () => [
      {
        icon: 'Maximize2',
        label: t('aiPanel.quickActionItems.expand.label'),
        operation: 'expand',
        instruction: t('aiPanel.quickActionItems.expand.instruction'),
        tooltip: t('aiPanel.quickActionItems.expand.tooltip'),
      },
      {
        icon: 'Minimize2',
        label: t('aiPanel.quickActionItems.shorten.label'),
        operation: 'shorten',
        instruction: t('aiPanel.quickActionItems.shorten.instruction'),
        tooltip: t('aiPanel.quickActionItems.shorten.tooltip'),
      },
      {
        icon: 'CheckCircle',
        label: t('aiPanel.quickActionItems.grammar.label'),
        operation: 'grammar',
        instruction: t('aiPanel.quickActionItems.grammar.instruction'),
        tooltip: t('aiPanel.quickActionItems.grammar.tooltip'),
      },
      {
        icon: 'FileText',
        label: t('aiPanel.quickActionItems.formal.label'),
        operation: 'formal',
        instruction: t('aiPanel.quickActionItems.formal.instruction'),
        tooltip: t('aiPanel.quickActionItems.formal.tooltip'),
      },
    ],
    [t]
  );
}
