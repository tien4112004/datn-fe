import { createContext, useContext, type ReactNode } from 'react';

interface ReadOnlyContextValue {
  isReadOnly: boolean;
}

const ReadOnlyContext = createContext<ReadOnlyContextValue>({ isReadOnly: false });

export const ReadOnlyProvider = ({ children, isReadOnly }: { children: ReactNode; isReadOnly: boolean }) => {
  return <ReadOnlyContext.Provider value={{ isReadOnly }}>{children}</ReadOnlyContext.Provider>;
};

export const useReadOnlyContext = () => {
  return useContext(ReadOnlyContext);
};
