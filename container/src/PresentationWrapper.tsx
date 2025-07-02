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

  return <div className="h-[960px]" ref={containerRef} />;
};

export default PresentationWrapper;
