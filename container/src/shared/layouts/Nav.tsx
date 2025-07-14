import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

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
        `${document.querySelector('nav')?.offsetHeight || 0}px`
      );
    }
  });

  return (
    !isFullscreen && (
      <nav className="p-4 bg-gray-100 header-nav flex gap-4">
        <NavLink to="/" className="hover:underline">
          {t('home')}
        </NavLink>
        <NavLink to="/presentation" className="hover:underline">
          {t('presentation')}
        </NavLink>
        <NavLink to="/presentation/123" className="hover:underline">
          {t('presentationDetails')}
        </NavLink>
      </nav>
    )
  );
};

export default Nav;
