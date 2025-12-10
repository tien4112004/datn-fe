import { createContext, useContext, useState, type ReactNode } from 'react';
import { getApiMode, setApiMode, type ApiMode } from '@aiprimary/api';

interface ApiSwitchingContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
}

const ApiSwitchingContext = createContext<ApiSwitchingContextType | undefined>(undefined);

export const useApiSwitching = () => {
  const context = useContext(ApiSwitchingContext);
  if (!context) {
    throw new Error('useApiSwitching must be used within ApiSwitchingProvider');
  }
  return context;
};

export const ApiSwitchingProvider = ({ children }: { children: ReactNode }) => {
  const [apiMode, setApiModeState] = useState<ApiMode>(getApiMode());

  const handleSetApiMode = (mode: ApiMode) => {
    setApiModeState(mode);
    setApiMode(mode);
  };

  return (
    <ApiSwitchingContext.Provider value={{ apiMode, setApiMode: handleSetApiMode }}>
      {children}
    </ApiSwitchingContext.Provider>
  );
};

export default ApiSwitchingContext;
