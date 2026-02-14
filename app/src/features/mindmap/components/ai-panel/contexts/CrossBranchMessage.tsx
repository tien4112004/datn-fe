import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CrossBranchContext } from '../../../types/aiModification';

interface Props {
  context: CrossBranchContext;
}

/**
 * Info message shown when multiple nodes from different branches are selected
 */
export function CrossBranchMessage({ context }: Props): React.ReactElement {
  const { t } = useTranslation('mindmap');

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <div className="rounded-full bg-amber-100 p-3">
        <AlertCircle className="h-6 w-6 text-amber-600" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700">
          {t('aiPanel.crossBranch.title', 'Multiple Branches Selected')}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {t('aiPanel.crossBranch.message', 'AI works best on nodes from the same branch')}
        </p>
      </div>
      <p className="text-xs text-gray-400">
        {t('aiPanel.crossBranch.hint', 'Selected {{count}} nodes from different branches', {
          count: context.nodeCount,
        })}
      </p>
    </div>
  );
}
