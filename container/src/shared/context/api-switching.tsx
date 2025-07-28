import { createContext, useContext, useState, type ReactNode } from 'react';

interface ApiSwitchingContextType {
  apiMode: 'mock' | 'real';
  setApiMode: (mode: 'mock' | 'real') => void;
}

const ApiSwitchingContext = createContext<ApiSwitchingContextType>({
  apiMode: 'mock',
  setApiMode: () => {},
});

const LOCAL_STORAGE_KEY = 'apiMode';

export const useApiSwitching = () => {
  const context = useContext(ApiSwitchingContext);
  if (!context) {
    throw new Error('useApiSwitching must be used within ApiSwitchingProvider');
  }
  return context;
};

export const ApiSwitchingProvider = ({ children }: { children: ReactNode }) => {
  const [apiMode, setApiMode] = useState<'mock' | 'real'>(
    (localStorage.getItem(LOCAL_STORAGE_KEY) as 'mock' | 'real') || 'mock'
  );

  const handleSetApiMode = (mode: 'mock' | 'real') => {
    setApiMode(mode);
    localStorage.setItem(LOCAL_STORAGE_KEY, mode);
  };

  return (
    <ApiSwitchingContext.Provider value={{ apiMode, setApiMode: handleSetApiMode }}>
      {children}
    </ApiSwitchingContext.Provider>
  );
};

export default ApiSwitchingContext;
