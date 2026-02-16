import type { TransactionStatus } from '../types';

export interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  label: string;
  popular?: boolean;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'basic', coins: 50, price: 50000, label: '50 Coins' },
  { id: 'standard', coins: 120, price: 100000, label: '120 Coins', popular: true },
  { id: 'premium', coins: 300, price: 200000, label: '300 Coins' },
  { id: 'mega', coins: 800, price: 500000, label: '800 Coins' },
];

export const TRANSACTION_STATUS_CONFIG: Record<
  TransactionStatus,
  { i18nKey: string; color: string; bgColor: string }
> = {
  PENDING: { i18nKey: 'status.pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  PROCESSING: { i18nKey: 'status.processing', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  COMPLETED: { i18nKey: 'status.completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  FAILED: { i18nKey: 'status.failed', color: 'text-red-700', bgColor: 'bg-red-100' },
  CANCELLED: { i18nKey: 'status.cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  REFUNDED: { i18nKey: 'status.refunded', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
};

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
