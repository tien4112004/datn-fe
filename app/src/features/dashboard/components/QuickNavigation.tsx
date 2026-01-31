import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Image, BrainCircuit, Presentation, HelpCircle, type LucideIcon } from 'lucide-react';

interface NavigationItem {
  path: string;
  icon: LucideIcon;
  labelKey: any;
  bgColor: string;
  iconColor: string;
  hoverBg: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/presentation/generate',
    icon: Presentation,
    labelKey: 'quickNav.presentation',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-950/50',
  },
  {
    path: '/mindmap/generate',
    icon: BrainCircuit,
    labelKey: 'quickNav.mindmap',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-950/50',
  },
  {
    path: '/image/generate',
    icon: Image,
    labelKey: 'quickNav.image',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-600 dark:text-green-400',
    hoverBg: 'hover:bg-green-100 dark:hover:bg-green-950/50',
  },
  {
    path: '/assignment/create',
    icon: ClipboardList,
    labelKey: 'quickNav.assignment',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-950/50',
  },
  {
    path: '/question-bank',
    icon: HelpCircle,
    labelKey: 'quickNav.questionsBank',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    hoverBg: 'hover:bg-cyan-100 dark:hover:bg-cyan-950/50',
  },
];

export const QuickNavigation = () => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">{t('quickNav.title')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all sm:gap-3 sm:p-6 ${item.bgColor} ${item.hoverBg}`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/80 sm:h-12 sm:w-12 dark:bg-black/20 ${item.iconColor}`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-center text-xs font-medium sm:text-sm">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
