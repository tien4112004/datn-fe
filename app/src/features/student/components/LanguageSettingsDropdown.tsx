import { useTranslation } from 'react-i18next';
import { Settings, Check, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { Button } from '@ui/button';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export const LanguageSettingsDropdown = () => {
  const { i18n, t } = useTranslation(I18N_NAMESPACES.AUTH);
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode !== i18n.language) {
      i18n.changeLanguage(languageCode);
      window.dispatchEvent(new Event('languageChanged'));
    }
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success(t('logout.success'));
        navigate('/login');
      },
      onError: () => {
        // Even if backend logout fails, frontend session is cleared
        // Still show success and redirect to login
        toast.success(t('logout.success'));
        navigate('/login');
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">Language</div>
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {i18n.language === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
