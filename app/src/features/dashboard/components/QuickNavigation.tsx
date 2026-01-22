import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Image, BrainCircuit, Presentation, type LucideIcon } from 'lucide-react';

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
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-950/50',
  },
  {
    path: '/mindmap/generate',
    icon: BrainCircuit,
    labelKey: 'quickNav.mindmap',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/50',
  },
  {
    path: '/assignments/create',
    icon: ClipboardList,
    labelKey: 'quickNav.assignment',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-950/50',
  },
  {
    path: '/image/generate',
    icon: Image,
    labelKey: 'quickNav.image',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
    hoverBg: 'hover:bg-pink-100 dark:hover:bg-pink-950/50',
  },
];

export const QuickNavigation = () => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-semibold">{t('quickNav.title')}</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex flex-col items-center justify-center gap-3 rounded-xl border p-6 transition-all ${item.bgColor} ${item.hoverBg}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-black/20 ${item.iconColor}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-center text-sm font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
