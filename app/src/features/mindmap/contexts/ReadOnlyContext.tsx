import { createContext, useContext, type ReactNode } from 'react';

interface PresenterContextValue {
  isPresenterMode: boolean;
}

const PresenterContext = createContext<PresenterContextValue>({ isPresenterMode: false });

export const PresenterProvider = ({
  children,
  isPresenterMode,
}: {
  children: ReactNode;
  isPresenterMode: boolean;
}) => {
  return <PresenterContext.Provider value={{ isPresenterMode }}>{children}</PresenterContext.Provider>;
};

export const usePresenterContext = () => {
  return useContext(PresenterContext);
};

// Backwards compatibility: keep ReadOnly names but map to presenter mode
export const ReadOnlyProvider = ({ children, isReadOnly }: { children: ReactNode; isReadOnly: boolean }) => (
  <PresenterProvider isPresenterMode={isReadOnly}>{children}</PresenterProvider>
);

export const useReadOnlyContext = () => {
  const { isPresenterMode } = usePresenterContext();
  return { isReadOnly: isPresenterMode } as const;
};
