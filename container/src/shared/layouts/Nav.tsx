import React from 'react';
import { Link } from 'react-router-dom';

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
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/presentation" className="hover:underline">
          Presentation
        </Link>
        <Link to="/presentation/123" className="hover:underline">
          Presentation Details
        </Link>
      </nav>
    )
  );
};

export default Nav;
