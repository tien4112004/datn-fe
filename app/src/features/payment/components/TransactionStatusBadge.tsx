import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { TransactionStatus } from '../types';
import { TRANSACTION_STATUS_CONFIG } from '../constants';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const { t } = useTranslation('payment');
  const config = TRANSACTION_STATUS_CONFIG[status] ?? TRANSACTION_STATUS_CONFIG.PENDING;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.bgColor,
        config.color,
        className
      )}
    >
      {t(config.i18nKey as never)}
    </span>
  );
}
