import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { SlideTheme } from '@aiprimary/core';
import { ChevronDown, Check } from 'lucide-react';

interface ThemeSelectorProps {
  themes: SlideTheme[];
  selectedThemeId: string | null;
  onThemeChange: (themeId: string) => void;
}

function getThemePreviewStyle(theme: SlideTheme): React.CSSProperties {
  const backgroundColor =
    typeof theme.backgroundColor === 'string'
      ? theme.backgroundColor
      : `linear-gradient(${(theme.backgroundColor as any).rotate}deg, ${(theme.backgroundColor as any).colors[0].color}, ${(theme.backgroundColor as any).colors[1].color})`;

  return { background: backgroundColor };
}

export function ThemeSelector({ themes, selectedThemeId, onThemeChange }: ThemeSelectorProps) {
  const selectedTheme = themes.find((t) => t.id === selectedThemeId);

  return (
    <div>
      <div className="text-muted-foreground mb-2 text-sm">Preview Theme</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="h-auto w-full justify-between py-2">
            {selectedTheme ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded shadow-sm"
                  style={getThemePreviewStyle(selectedTheme)}
                >
                  <span className="text-xs font-bold" style={{ color: selectedTheme.titleFontColor }}>
                    Aa
                  </span>
                </div>
                <span className="text-sm">{selectedTheme.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Select theme...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-3" align="start">
          <div className="grid max-h-[400px] grid-cols-3 gap-3 overflow-y-auto">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id ?? '')}
                className={`relative rounded-lg border-2 p-2 transition-all hover:border-gray-300 ${
                  selectedThemeId === theme.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                }`}
              >
                {selectedThemeId === theme.id && (
                  <div className="absolute right-1 top-1 rounded-full bg-blue-500 p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div
                  className="mb-2 flex h-16 w-full items-center justify-center rounded shadow-sm"
                  style={getThemePreviewStyle(theme)}
                >
                  <div className="text-2xl font-bold" style={{ color: theme.titleFontColor }}>
                    Aa
                  </div>
                </div>
                <div className="truncate text-center text-xs text-gray-600">{theme.name}</div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
