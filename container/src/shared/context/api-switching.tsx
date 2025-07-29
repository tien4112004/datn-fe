import { createContext, useContext, useState, type ReactNode } from 'react';
import { API_MODE, type ApiMode } from '@/shared/constants';

interface ApiSwitchingContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
}

const ApiSwitchingContext = createContext<ApiSwitchingContextType | null>(null);

const LOCAL_STORAGE_KEY = 'apiMode';

export const useApiSwitching = () => {
  const context = useContext(ApiSwitchingContext);
  if (!context) {
    throw new Error('useApiSwitching must be used within ApiSwitchingProvider');
  }
  return context;
};

export const ApiSwitchingProvider = ({ children }: { children: ReactNode }) => {
  const getInitialApiMode = (): ApiMode => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored === API_MODE.mock || stored === API_MODE.real ? stored : API_MODE.mock;
  };

  const [apiMode, setApiMode] = useState<ApiMode>(getInitialApiMode());

  const handleSetApiMode = (mode: ApiMode) => {
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
