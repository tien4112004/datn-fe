import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BackendUrlStore {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  getBackendUrl: () => string;
}

const useBackendUrlStore = create<BackendUrlStore>()(
  devtools((set, get) => ({
    backendUrl: import.meta.env.VITE_BACKEND_URL!,
    setBackendUrl: (url: string) => set({ backendUrl: url }),
    getBackendUrl: () => get().backendUrl,
  }))
);

export default useBackendUrlStore;
