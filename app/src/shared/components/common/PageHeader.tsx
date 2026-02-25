import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, description, actions, onBack }: PageHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <div>
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('pages.goBack')}
        </Button>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
