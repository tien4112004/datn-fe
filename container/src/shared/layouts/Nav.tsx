import React from 'react';
import { NavLink } from 'react-router-dom';

const Nav = () => {
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
          Home
        </NavLink>
        <NavLink to="/presentation" className="hover:underline">
          Presentation
        </NavLink>
        <NavLink to="/presentation/123" className="hover:underline">
          Presentation Details
        </NavLink>
      </nav>
    )
  );
};

export default Nav;
