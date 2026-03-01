import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CommonTabs, { type TabItem } from '@/shared/components/common/CommonTabs';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { PageContainer } from '@/shared/components/common/PageContainer';
import DevToolsSettings from '../components/DevToolsSettings';
import LanguageSettings from '../components/LanguageSettings';
import UserProfilePage from '@/features/user/components/UserProfile';

function SettingsPage() {
  const { t } = useTranslation('settings');
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'general';

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', value);
      return newParams;
    });
  };

  const tabItems: TabItem[] = [
    {
      key: 'profile',
      value: 'profile',
      label: t('tabs.profile'),
      content: <UserProfilePage />,
    },
    {
      key: 'general',
      value: 'general',
      label: t('tabs.general'),
      content: (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h3 className="text-lg font-medium">{t('language.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('language.subtitle')}</p>
            </div>
            <div className="lg:col-span-2">
              <LanguageSettings />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'devtools',
      value: 'devtools',
      label: t('tabs.devtools'),
      content: <DevToolsSettings />,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-auto">
        <PageContainer>
          <PageHeader title={t('title')} description={t('subtitle')} />

          <div className="flex w-full flex-col gap-6">
            <CommonTabs
              value={currentTab}
              onValueChange={handleTabChange}
              items={tabItems}
              tabsListClassName="bg-card flex w-full flex-row justify-start rounded-none border-b p-0"
              tabsClassName="w-full"
            />
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

export default SettingsPage;
