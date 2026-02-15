import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Info message shown when no nodes are selected
 */
export function NoSelectionState(): React.ReactElement {
  const { t } = useTranslation('mindmap');

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <div className="rounded-full bg-purple-100 p-3">
        <Sparkles className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700">{t('aiPanel.noSelection.title')}</h3>
        <p className="mt-1 text-xs text-gray-500">{t('aiPanel.noSelection.message')}</p>
      </div>
      <div className="mt-2 max-w-xs text-xs text-gray-400">
        <p>{t('aiPanel.noSelection.hint')}</p>
      </div>
    </div>
  );
}
