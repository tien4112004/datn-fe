import { useEffect, useRef } from 'react';

const PresentationWrapper = () => {
  const containerRef = useRef(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    // Calculate and set header height as CSS custom property
    const updateHeaderHeight = () => {
      const header = document.querySelector('.header-nav');
      if (header) {
        const headerHeight = header.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      }
    };

    // Initial calculation
    updateHeaderHeight();

    // Recalculate on window resize
    window.addEventListener('resize', updateHeaderHeight);

    if (hasMounted.current) return;
    hasMounted.current = true;

    import('vueRemote/Editor')
      .then((mod) => {
        mod.mount(containerRef.current);
      })
      .catch((err) => {
        console.error('Failed to load Vue remote:', err);
      });

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // vue-remote must match the style's name in presentation/src/assets/styles/scope.scss
  return <div className="vue-remote" ref={containerRef} />;
};

export default PresentationWrapper;
