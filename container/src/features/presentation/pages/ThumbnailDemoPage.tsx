import { useEffect, useRef, useState } from 'react';

// Demo data - hardcoded slides similar to the Vue version
const demoSlides = [
  {
    id: 'demo-slide-1',
    elements: [
      {
        type: 'text',
        id: 'text-1',
        left: 300,
        top: 200,
        width: 300,
        height: 120,
        content: '<span style="font-size: 64px;">Demo Slide 1</span>',
        rotate: 0,
        defaultFontName: 'Arial',
        defaultColor: '#333333',
      },
    ],
  },
  {
    id: 'demo-slide-2',
    elements: [
      {
        type: 'text',
        id: 'text-2',
        left: 300,
        top: 200,
        width: 300,
        height: 120,
        content: '<span style="font-size: 64px;">Demo Slide 2</span>',
        rotate: 0,
        defaultFontName: 'Arial',
        defaultColor: '#333333',
      },
    ],
  },
  {
    id: 'demo-slide-3',
    elements: [
      {
        type: 'text',
        id: 'text-3',
        left: 300,
        top: 200,
        width: 300,
        height: 120,
        content: '<span style="font-size: 64px;">Demo Slide 3</span>',
        rotate: 0,
        defaultFontName: 'Arial',
        defaultColor: '#333333',
      },
    ],
  },
  {
    id: 'demo-slide-4',
    elements: [
      {
        type: 'text',
        id: 'text-4',
        left: 300,
        top: 200,
        width: 300,
        height: 120,
        content: '<span style="font-size: 64px;">Demo Slide 4</span>',
        rotate: 0,
        defaultFontName: 'Arial',
        defaultColor: '#333333',
      },
    ],
  },
];

const VueThumbnailSlide = ({ slide, size, visible }: { slide: any; size: number; visible: boolean }) => {
  const containerRef = useRef(null);
  const hasMounted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
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
      <div ref={containerRef} className="w-90 h-40" />
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

const ThumbnailDemoPage = () => {
  return (
    <div className="mx-auto max-w-6xl p-5">
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="m-0 text-2xl font-semibold text-gray-900">Thumbnail Demo</h2>
        <div className="">
          <span className="rounded-xl bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {demoSlides.length} slides
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
        {demoSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative cursor-pointer overflow-hidden rounded-lg border-2 border-transparent bg-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <VueThumbnailSlide slide={slide} size={180} visible={true} />
            <div className="absolute left-2 top-2 z-10 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {demoSlides.length === 0 && (
        <div className="py-15 text-center text-base text-gray-600">
          <p>No slides available to display</p>
        </div>
      )}
    </div>
  );
};

export default ThumbnailDemoPage;
