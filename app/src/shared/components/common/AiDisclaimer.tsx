import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

export function AiDisclaimer() {
  const { t } = useTranslation(I18N_NAMESPACES.COMMON);

  return (
    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <TriangleAlert className="h-3.5 w-3.5 flex-shrink-0" />
      {t('aiDisclaimer')}
    </p>
  );
}
