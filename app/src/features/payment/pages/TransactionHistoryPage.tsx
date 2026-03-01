import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/components/common/PageContainer';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { cn } from '@/shared/lib/utils';
import { CoinBalanceBadge } from '../components/CoinBalanceBadge';
import { TransactionHistoryTab } from '../components/TransactionHistoryTab';
import { CoinHistoryTab } from '../components/CoinHistoryTab';

type Tab = 'transactions' | 'coinHistory';

export function TransactionHistoryPage() {
  const { t } = useTranslation('payment');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('transactions');

  const tabs: { value: Tab; label: string }[] = [
    { value: 'transactions', label: t('coinHistory.tabTransactions') },
    { value: 'coinHistory', label: t('coinHistory.tabCoinHistory') },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={t('history.title')}
          description={t('history.subtitle')}
          onBack={() => navigate('/payment')}
          actions={<CoinBalanceBadge />}
        />

        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'transactions' && <TransactionHistoryTab />}
        {activeTab === 'coinHistory' && <CoinHistoryTab />}
      </div>
    </PageContainer>
  );
}
