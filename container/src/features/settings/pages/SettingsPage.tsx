import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralSettings from '../components/GeneralSettings';
import AppearanceSettings from '../components/AppearanceSettings';
import DevToolsSettings from '../components/DevToolsSettings';

function SettingsPage() {
  return (
    <div className="flex flex-col gap-2 px-8 py-4">
      <h1 className="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight">Settings</h1>

      <p className="text-muted-foreground text-sm">Manage your personal preferences.</p>

      <div className="flex w-full flex-col gap-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-card flex w-full flex-row justify-start rounded-none border-b p-0">
            <TabsTrigger
              key="general"
              value="general"
              className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              key="appearance"
              value="appearance"
              className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger
              key="devtools"
              value="devtools"
              className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              devtools
            </TabsTrigger>
          </TabsList>
          <TabsContent key="general" value="general">
            <GeneralSettings />
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
