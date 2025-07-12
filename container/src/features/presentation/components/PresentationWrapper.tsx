import { useEffect, useRef } from 'react';

const PresentationWrapper = () => {
  const containerRef = useRef(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    import('vueRemote/Editor')
      .then((mod) => {
        mod.mount(containerRef.current);
      })
      .catch((err) => {
        console.error('Failed to load Vue remote:', err);
      });
  }, []);

  // vue-remote must match the style's name in presentation/src/assets/styles/scope.scss
  return <div className="vue-remote" ref={containerRef} />;
};

export default PresentationWrapper;
