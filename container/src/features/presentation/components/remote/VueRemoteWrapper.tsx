import { useEffect, useRef, useState } from 'react';

interface VueRemoteWrapperProps<T = any> {
  modulePath: string;
  mountProps: T;
  className?: string;
  LoadingComponent?: React.ComponentType;
  ErrorComponent?: React.ComponentType<{ error: Error }>;
  onMountSuccess?(): void;
  onMountError?(error: Error): void;
}

const moduleMap = {
  editor: () => import('vueRemote/Editor'),
  thumbnail: () => import('vueRemote/ThumbnailSlide'),
} as Record<string, () => Promise<{ mount: (el: HTMLElement | null, props: any) => void }>>;

const VueRemoteWrapper = <T,>({
  modulePath,
  mountProps,
  className = '',
  LoadingComponent,
  ErrorComponent,
  onMountSuccess,
  onMountError,
}: VueRemoteWrapperProps<T>) => {
  const containerRef = useRef(null);
  const hasMounted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    setIsLoading(true);
    setError(null);

    if (!moduleMap[modulePath]) {
      const err = new Error(`Unknown module path: ${modulePath}`);
      setIsLoading(false);
      setError(err);
      onMountError?.(err);
      return;
    }

    moduleMap[modulePath]()
      .then((mod) => {
        mod.mount(containerRef.current, mountProps);
        setIsLoading(false);
        onMountSuccess?.();
      })
      .catch((err) => {
        console.error(`Failed to load Vue remote (${modulePath}):`, err);
        setIsLoading(false);
        setError(err);
        onMountError?.(err);
      });
  }, [modulePath, mountProps, onMountSuccess, onMountError]);

  return (
    <>
      <div ref={containerRef} className={className} />
      {isLoading && LoadingComponent && <LoadingComponent />}
      {error && ErrorComponent && <ErrorComponent error={error} />}
    </>
  );
};

export default VueRemoteWrapper;
