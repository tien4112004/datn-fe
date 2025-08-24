import { useRef, useEffect } from 'react';

interface ChangedProp {
  from: any;
  to: any;
}

interface ChangedProps {
  [key: string]: ChangedProp;
}

export function useWhyDidYouUpdate<T extends Record<string, any>>(name: string, props: T): void {
  const previous = useRef<T>({} as T);

  useEffect(() => {
    if (previous.current) {
      const allKeys = Object.keys({ ...previous.current, ...props });
      const changedProps: ChangedProps = {};

      allKeys.forEach((key) => {
        if (previous.current![key] !== props[key]) {
          changedProps[key] = {
            from: previous.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previous.current = props;
  });
}
