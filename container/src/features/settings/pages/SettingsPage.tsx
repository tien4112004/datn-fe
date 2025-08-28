import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedFontSize, setSelectedFontSize] = useState('medium');
  const [useMockData, setUseMockData] = useState(false);
  const [backendUrl, setBackendUrl] = useState('https://api.yourapp.com');

  const [models, setModels] = useState([
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      mediaTypes: ['Text', 'Image'],
      enabled: true,
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      mediaTypes: ['Text'],
      enabled: true,
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      mediaTypes: ['Text', 'Image', 'Video'],
      enabled: false,
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      provider: 'OpenAI',
      mediaTypes: ['Image'],
      enabled: true,
    },
  ]);

  const toggleModelEnabled = (modelId: string) => {
    setModels(models.map((model) => (model.id === modelId ? { ...model, enabled: !model.enabled } : model)));
  };

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
              key="admin"
              value="admin"
              className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Admin
            </TabsTrigger>
          </TabsList>
          <TabsContent key="general" value="general">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-medium">Profile</h3>
                  <p className="text-muted-foreground text-sm">Update your personal information.</p>
                </div>
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="Enter your first name" className="w-full" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Enter your last name" className="w-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="w-full max-w-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="pt-2">
                <div className="flex gap-3">
                  <Button>Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent key="appearance" value="appearance">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <p className="text-muted-foreground text-sm">
                    Customize the appearance of the application.
                  </p>
                </div>
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Color theme</Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            selectedTheme === 'light'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedTheme('light')}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full border border-gray-300 bg-white"></div>
                              <span className="text-sm font-medium">Light</span>
                            </div>
                            <div className="flex h-8 w-full items-center rounded border border-gray-200 bg-white px-2">
                              <div className="h-1 w-6 rounded bg-gray-300"></div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            selectedTheme === 'dark'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedTheme('dark')}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full border border-gray-600 bg-gray-900"></div>
                              <span className="text-sm font-medium">Dark</span>
                            </div>
                            <div className="flex h-8 w-full items-center rounded border border-gray-700 bg-gray-900 px-2">
                              <div className="h-1 w-6 rounded bg-gray-500"></div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            selectedTheme === 'system'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedTheme('system')}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full border border-gray-400 bg-gradient-to-r from-white to-gray-900"></div>
                              <span className="text-sm font-medium">System</span>
                            </div>
                            <div className="flex h-8 w-full items-center rounded border border-gray-400 bg-gradient-to-r from-white to-gray-900 px-2">
                              <div className="h-1 w-6 rounded bg-gray-400"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Font size</Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            selectedFontSize === 'small'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedFontSize('small')}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Small</span>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-xs">Sample text</div>
                              <div className="text-xs">The quick brown fox</div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            selectedFontSize === 'medium'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedFontSize('medium')}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Medium</span>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-sm">Sample text</div>
                              <div className="text-sm">The quick brown fox</div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            selectedFontSize === 'large'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedFontSize('large')}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Large</span>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-base">Sample text</div>
                              <div className="text-base">The quick brown fox</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
              <div className="pt-2">
                <Button>Save Preferences</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent key="admin" value="admin">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-medium">Development</h3>
                  <p className="text-muted-foreground text-sm">Development and testing configurations.</p>
                </div>
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Use mock data</Label>
                        <p className="text-muted-foreground text-sm">
                          Enable mock data for development and testing
                        </p>
                      </div>
                      <Switch checked={useMockData} onCheckedChange={setUseMockData} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backendUrl">Backend URL</Label>
                      <Input
                        id="backendUrl"
                        value={backendUrl}
                        onChange={(e) => setBackendUrl(e.target.value)}
                        placeholder="Enter backend URL"
                        className="w-full max-w-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">AI Models</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage available AI models and their configurations.
                  </p>
                </div>
                <div className="rounded-lg border">
                  <div className="bg-muted/50 grid grid-cols-5 gap-4 border-b p-4 text-sm font-medium">
                    <div>Model</div>
                    <div>Provider</div>
                    <div>Media Types</div>
                    <div>Model ID</div>
                    <div>Status</div>
                  </div>
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="grid grid-cols-5 items-center gap-4 border-b p-4 last:border-b-0"
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-muted-foreground text-sm">{model.provider}</div>
                      <div className="flex flex-wrap gap-1">
                        {model.mediaTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      <div className="text-muted-foreground font-mono text-sm">{model.id}</div>
                      <div>
                        <Switch
                          checked={model.enabled}
                          onCheckedChange={() => toggleModelEnabled(model.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Danger Zone</h3>
                  <p className="text-muted-foreground text-sm">Irreversible and destructive actions.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="destructive">Clear All Logs</Button>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Delete Everything
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;
