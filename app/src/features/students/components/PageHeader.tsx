import { ArrowLeft } from 'lucide-react';
import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, onBack, action }: PageHeaderProps) {
  const { t } = useTranslation('classes', { keyPrefix: 'studentDetail.actions' });

  return (
    <div className="space-y-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-muted group shrink-0 transition-colors"
              aria-label={t('goBack')}
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Button>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {description && <p className="text-muted-foreground pl-10 text-sm sm:text-base">{description}</p>}
    </div>
  );
}
