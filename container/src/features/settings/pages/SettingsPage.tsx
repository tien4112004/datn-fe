import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import GeneralSettings from '../components/GeneralSettings';
import AppearanceSettings from '../components/AppearanceSettings';
import DevToolsSettings from '../components/DevToolsSettings';
import LanguageSettings from '../components/LanguageSettings';

function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <div className="flex flex-col gap-2 px-8 py-4">
      <h1 className="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight">{t('title')}</h1>

      <p className="text-muted-foreground text-sm">{t('subtitle')}</p>

      <div className="flex w-full flex-col gap-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-card flex w-full flex-row justify-start rounded-none border-b p-0">
            <TabsTrigger
              key="general"
              value="general"
              className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              {t('tabs.general')}
            </TabsTrigger>
            <TabsTrigger
              key="appearance"
              value="appearance"
              className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              {t('tabs.appearance')}
            </TabsTrigger>
            <TabsTrigger
              key="devtools"
              value="devtools"
              className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              {t('tabs.devtools')}
            </TabsTrigger>
          </TabsList>
          <TabsContent key="general" value="general">
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
          </TabsContent>
          <TabsContent key="appearance" value="appearance">
            <AppearanceSettings />
          </TabsContent>
          <TabsContent key="devtools" value="devtools">
            <DevToolsSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;
