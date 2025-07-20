// DEPRECATED: This file is no longer in use.

import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const change = (code: string) => {
    if (code !== i18n.language) i18n.changeLanguage(code);
    setOpen(false);
    window.dispatchEvent(new Event('languageChanged'));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="flex items-center px-8" title="Change language">
          <span className="text-lg leading-none">{current.flag}</span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-44 p-0">
        <div className="grid">
          {LANGUAGES.map((language, index) => {
            const active = language.code === i18n.language;
            return (
              <Button
                key={language.code}
                variant="ghost"
                className={clsx(
                  'w-full justify-start text-left hover:bg-primary hover:text-primary-foreground',
                  active && 'bg-accent hover:bg-secondary hover:text-secondary-foreground',
                  index === 0 && 'rounded-bl-none rounded-br-none',
                  index === LANGUAGES.length - 1 && 'rounded-tl-none rounded-tr-none'
                )}
                onClick={() => {
                  change(language.code);
                }}
              >
                {active && <Check className="mr-2" />}
                <span className="text-lg leading-none">{language.flag}</span> {language.name}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
