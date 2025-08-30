const BACKEND_URL_KEY = 'backend-url';

export function getBackendUrl(): string {
  const storedUrl = localStorage.getItem(BACKEND_URL_KEY);
  return storedUrl || import.meta.env.VITE_BACKEND_URL!;
}

export function setBackendUrl(url: string): void {
  localStorage.setItem(BACKEND_URL_KEY, url);
}
