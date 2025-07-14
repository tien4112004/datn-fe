import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Nav = () => {
  const { t } = useTranslation('nav');

  const [isFullscreen, setIsFullscreen] = React.useState(document.fullscreenElement !== null);

  window.addEventListener('fullscreenchange', () => {
    setIsFullscreen(document.fullscreenElement !== null);
    document.documentElement.style.setProperty('--header-height', `${0}px`);
  });

  window.addEventListener('resize', () => {
    if (document.fullscreenElement) {
      document.documentElement.style.setProperty('--header-height', `${0}px`);
    } else {
      document.documentElement.style.setProperty(
        '--header-height',
        `${(document.querySelector('nav')?.clientHeight || 0) + 16}px`
      );
    }
  });

  React.useEffect(() => {
    if (!document.fullscreenElement) {
      document.documentElement.style.setProperty(
        '--header-height',
        `${(document.querySelector('nav')?.clientHeight || 0) + 16}px`
      );
    }
  });

  return (
    !isFullscreen && (
      <nav className="px-4 py-2 bg-gray-100  flex items-center justify-between">
        <div className="flex gap-4">
          <NavLink to="/" className="hover:underline">
            {t('home')}
          </NavLink>
          <NavLink to="/presentation" className="hover:underline">
            {t('presentation')}
          </NavLink>
          <NavLink to="/presentation/123" className="hover:underline">
            {t('presentationDetails')}
          </NavLink>
        </div>

        <div>
          <LanguageSwitcher />
        </div>
      </nav>
    )
  );
};

export default Nav;
