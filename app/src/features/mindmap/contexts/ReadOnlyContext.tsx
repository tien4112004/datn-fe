import { createContext, useContext, type ReactNode } from 'react';

interface PresenterContextValue {
  isPresenterMode: boolean;
  isViewMode: boolean;
  isReadOnly: boolean;
}

const PresenterContext = createContext<PresenterContextValue>({
  isPresenterMode: false,
  isViewMode: false,
  isReadOnly: false,
});

export const PresenterProvider = ({
  children,
  isPresenterMode,
  isViewMode = false,
}: {
  children: ReactNode;
  isPresenterMode: boolean;
  isViewMode?: boolean;
}) => {
  // Combined read-only state: true if either presenter mode OR view mode is active
  const isReadOnly = isPresenterMode || isViewMode;

  return (
    <PresenterContext.Provider value={{ isPresenterMode, isViewMode, isReadOnly }}>
      {children}
    </PresenterContext.Provider>
  );
};

export const usePresenterContext = () => {
  return useContext(PresenterContext);
};

// Backwards compatibility: keep ReadOnly names but map to presenter mode
export const ReadOnlyProvider = ({ children, isReadOnly }: { children: ReactNode; isReadOnly: boolean }) => (
  <PresenterProvider isPresenterMode={isReadOnly}>{children}</PresenterProvider>
);

export const useReadOnlyContext = () => {
  const { isReadOnly } = usePresenterContext();
  return { isReadOnly } as const;
};
