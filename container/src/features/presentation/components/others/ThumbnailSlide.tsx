import React from 'react';

const ThumbnailSlide = ({ slide, size, visible }: { slide: any; size: number; visible: boolean }) => {
  const containerRef = React.useRef(null);
  const hasMounted = React.useRef(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    // Prevent re-mounting if it has already been mounted
    if (hasMounted.current) return;
    hasMounted.current = true;

    setIsLoading(true);

    import('vueRemote/ThumbnailSlide')
      .then((mod) => {
        // Use the mount function
        mod.mount(containerRef.current, {
          slide,
          size,
          visible,
        });

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Vue ThumbnailSlide:', err);
        setIsLoading(false);
        setIsError(true);
      });
  }, []);

  return (
    <>
      <div ref={containerRef} className="h-auto w-auto" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          Loading...
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600">
          Error loading slide
        </div>
      )}
    </>
  );
};

export default ThumbnailSlide;
