import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { type ModelOption } from '@/features/model';
import { MODEL_PROVIDERS_LOGO } from '@/features/presentation/types';
import { useTranslation } from 'react-i18next';

interface ModelSelectProps {
  models?: ModelOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  showProviderLogo?: boolean;
}

export const ModelSelect = ({
  models,
  value,
  onValueChange,
  placeholder,
  label,
  className = 'bg-card w-fit',
  disabled = false,
  showProviderLogo = true,
}: ModelSelectProps) => {
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder || t('common:model.placeholder');
  const defaultLabel = label || t('common:model.label');

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{defaultLabel}</SelectLabel>
          {models?.map((modelOption) => (
            <SelectItem
              key={modelOption.id}
              value={modelOption.name}
              disabled={!modelOption.enabled}
              className={!modelOption.enabled ? 'opacity-50' : ''}
            >
              {showProviderLogo && (
                <img
                  src={MODEL_PROVIDERS_LOGO[modelOption.provider]}
                  alt={modelOption.provider}
                  className="mr-2 inline h-4 w-4"
                />
              )}
              {modelOption.displayName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
