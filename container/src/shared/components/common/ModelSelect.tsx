import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { type Model } from '@/features/model';
import { MODEL_PROVIDERS_LOGO } from '@/features/presentation/types';
import { useTranslation } from 'react-i18next';

interface ModelValue {
  name: string;
  provider: string;
}

interface ModelSelectProps {
  value?: ModelValue | string;
  onValueChange?: (value: ModelValue | string) => void;
  models?: Model[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  showProviderLogo?: boolean;
  isLoading?: boolean;
  isError?: boolean;
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
  isLoading = false,
  isError = false,
}: ModelSelectProps) => {
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder || t('common:model.placeholder');
  const defaultLabel = label || t('common:model.label');

  const getPlaceholderText = () => {
    if (isLoading) return t('common:model.loading') || 'Loading models...';
    if (isError) return t('common:model.error') || 'Error loading models';
    return defaultPlaceholder;
  };

  return (
    <Select
      value={typeof value === 'string' ? value : value?.name}
      onValueChange={(name) =>
        onValueChange?.({ name, provider: models?.find((m) => m.name === name)?.provider || '' })
      }
      disabled={disabled || isLoading || isError}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={getPlaceholderText()} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{defaultLabel}</SelectLabel>
          {!isLoading &&
            !isError &&
            models?.map((modelOption) => (
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
                <span>{modelOption.displayName}</span>
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
