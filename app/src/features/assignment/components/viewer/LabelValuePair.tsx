import { cn } from '@/shared/lib/utils';

interface LabelValuePairProps {
  label: string;
  value?: string | number | boolean | null;
  emptyText?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export const LabelValuePair = ({
  label,
  value,
  emptyText = '—',
  labelClassName,
  valueClassName,
}: LabelValuePairProps) => {
  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <div className="flex flex-col gap-1">
      <label className={cn('text-xs font-medium text-gray-500 dark:text-gray-400', labelClassName)}>
        {label}
      </label>
      <div className={cn('text-sm text-gray-900 dark:text-gray-100', valueClassName)}>
        {hasValue ? (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value) : emptyText}
      </div>
    </div>
  );
};
