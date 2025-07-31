import { createContext, useContext, useState, type ReactNode } from 'react';
import { API_MODE, type ApiMode } from '@/shared/constants';

interface ApiSwitchingContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
}

const ApiSwitchingContext = createContext<ApiSwitchingContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'apiMode';

export const useApiSwitching = () => {
  const context = useContext(ApiSwitchingContext);
  if (!context) {
    throw new Error('useApiSwitching must be used within ApiSwitchingProvider');
  }
  return context;
};

export const getApiMode = (): ApiMode => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored === API_MODE.mock || stored === API_MODE.real ? stored : API_MODE.mock;
};

export const ApiSwitchingProvider = ({ children }: { children: ReactNode }) => {
  const [apiMode, setApiMode] = useState<ApiMode>(getApiMode());

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
