import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const CollapsibleSection = ({
  title,
  icon,
  defaultOpen = true,
  children,
  actions,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {icon && <span className="flex items-center text-gray-600 dark:text-gray-400">{icon}</span>}
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {actions && <div className="ml-2">{actions}</div>}
      </div>

      {/* Content */}
      {isOpen && <div>{children}</div>}
    </div>
  );
};
