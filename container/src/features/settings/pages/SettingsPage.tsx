import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CommonTabs, { type TabItem } from '@/shared/components/common/CommonTabs';
import { Separator } from '@/shared/components/ui/separator';
import GeneralSettings from '../components/GeneralSettings';
import AppearanceSettings from '../components/AppearanceSettings';
import DevToolsSettings from '../components/DevToolsSettings';
import LanguageSettings from '../components/LanguageSettings';

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
          <Separator />
          <GeneralSettings />
        </div>
      ),
    },
    {
      key: 'appearance',
      value: 'appearance',
      label: t('tabs.appearance'),
      content: <AppearanceSettings />,
    },
    {
      key: 'devtools',
      value: 'devtools',
      label: t('tabs.devtools'),
      content: <DevToolsSettings />,
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-8 py-4">
      <h1 className="scroll-m-20 text-balance text-4xl font-bold tracking-tight">{t('title')}</h1>

      <p className="text-muted-foreground text-sm">{t('subtitle')}</p>

      <div className="flex w-full flex-col gap-6">
        <CommonTabs
          value={currentTab}
          onValueChange={handleTabChange}
          items={tabItems}
          tabsListClassName="bg-card flex w-full flex-row justify-start rounded-none border-b p-0"
          tabsClassName="w-full"
        />
      </div>
    </div>
  );
}

export default SettingsPage;
