import { useState } from 'react';
import { Label } from '@ui/label';
import { Separator } from '@ui/separator';
import { Button } from '@ui/button';

const AppearanceSettings = () => {
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedFontSize, setSelectedFontSize] = useState('medium');

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium">Theme</h3>
          <p className="text-muted-foreground text-sm">Customize the appearance of the application.</p>
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
  );
};

export default AppearanceSettings;
