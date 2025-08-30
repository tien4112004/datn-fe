import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const LanguageSettings = () => {
  const { i18n } = useTranslation('settings');

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode !== i18n.language) {
      i18n.changeLanguage(languageCode);
      window.dispatchEvent(new Event('languageChanged'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{language.flag}</span>
                  <span>{language.name}</span>
                  {language.code === i18n.language && <Check className="ml-auto h-4 w-4" />}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSettings;
