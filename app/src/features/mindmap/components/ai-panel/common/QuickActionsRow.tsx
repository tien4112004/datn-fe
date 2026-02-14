import React from 'react';
import { Maximize2, Minimize2, CheckCircle, FileText, Loader } from 'lucide-react';
import type { QuickAction } from '../../../types/aiModification';

interface QuickActionsRowProps {
  actions: QuickAction[];
  onActionClick: (operation: string, instruction: string) => Promise<void>;
  isLoading?: boolean;
}

// Map icon names to lucide-react components
const iconMap: Record<string, React.ReactNode> = {
  Maximize2: <Maximize2 className="h-4 w-4" />,
  Minimize2: <Minimize2 className="h-4 w-4" />,
  CheckCircle: <CheckCircle className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
};

/**
 * Row of quick action buttons for common AI operations
 */
export function QuickActionsRow({
  actions,
  onActionClick,
  isLoading = false,
}: QuickActionsRowProps): React.ReactElement {
  const handleClick = async (action: QuickAction) => {
    await onActionClick(action.operation, action.instruction);
  };

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Quick Actions</label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.operation}
            onClick={() => handleClick(action)}
            disabled={isLoading}
            title={action.tooltip}
            className="flex items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : iconMap[action.icon]}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
