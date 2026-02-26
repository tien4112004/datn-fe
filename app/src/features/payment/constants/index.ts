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

const COIN_TYPE_LABEL_KEYS: Record<string, string> = {
  add: 'coinHistory.typeLabels.add',
  subtract: 'coinHistory.typeLabels.subtract',
};

const COIN_SOURCE_LABEL_KEYS: Record<string, string> = {
  sepay: 'coinHistory.sourceLabels.sepay',
  payos: 'coinHistory.sourceLabels.payos',
  outline: 'coinHistory.sourceLabels.outline',
  presentation: 'coinHistory.sourceLabels.presentation',
  refine_mindmap_node: 'coinHistory.sourceLabels.refine_mindmap_node',
  expand_mindmap_node: 'coinHistory.sourceLabels.expand_mindmap_node',
  refine_mindmap_branch: 'coinHistory.sourceLabels.refine_mindmap_branch',
  mindmap: 'coinHistory.sourceLabels.mindmap',
  refine_content: 'coinHistory.sourceLabels.refine_content',
  transform_layout: 'coinHistory.sourceLabels.transform_layout',
  refine_element_text: 'coinHistory.sourceLabels.refine_element_text',
  refine_combined_text: 'coinHistory.sourceLabels.refine_combined_text',
  image: 'coinHistory.sourceLabels.image',
};

export const getCoinTypeLabelKey = (type: string): string =>
  COIN_TYPE_LABEL_KEYS[type] ?? 'coinHistory.typeLabels.unknown';

export const getCoinSourceLabelKey = (source: string): string =>
  COIN_SOURCE_LABEL_KEYS[source] ?? 'coinHistory.sourceLabels.unknown';

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
