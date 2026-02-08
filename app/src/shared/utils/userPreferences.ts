const STORAGE_KEY = 'user-preferences';

type UserPreferences = Record<string, boolean>;

function readPreferences(): UserPreferences {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getUserPreference(key: string): boolean {
  return !!readPreferences()[key];
}

export function setUserPreference(key: string, value: boolean): void {
  const prefs = readPreferences();
  prefs[key] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearUserPreferences(): void {
  localStorage.removeItem(STORAGE_KEY);
}
