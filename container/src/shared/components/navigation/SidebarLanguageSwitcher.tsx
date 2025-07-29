import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { Check, Languages } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/components/ui/sidebar';
import clsx from 'clsx';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const SidebarLanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const change = (code: string) => {
    if (code !== i18n.language) i18n.changeLanguage(code);
    setOpen(false);
    window.dispatchEvent(new Event('languageChanged'));
  };

  return (
    <SidebarMenuItem>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SidebarMenuButton size="sm">
            <Languages />
            <span>{current.name}</span>
          </SidebarMenuButton>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-44 p-0">
          <div className="grid">
            {LANGUAGES.map((language, index) => {
              const active = language.code === i18n.language;
              return (
                <Button
                  key={language.code}
                  variant="ghost"
                  className={clsx(
                    'hover:bg-primary hover:text-primary-foreground w-full justify-start text-left',
                    active && 'bg-accent hover:bg-secondary hover:text-secondary-foreground',
                    index === 0 && 'rounded-bl-none rounded-br-none',
                    index === LANGUAGES.length - 1 && 'rounded-tl-none rounded-tr-none'
                  )}
                  onClick={() => {
                    change(language.code);
                  }}
                >
                  {active && <Check className="mr-2 h-4 w-4" />}
                  <span className="text-lg leading-none">{language.flag}</span> {language.name}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  );
};

export default SidebarLanguageSwitcher;
