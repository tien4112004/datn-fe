/**
 * Essential utility functions for handling URL search parameters
 * Works directly with the browser's current URL
 */

export type SearchParamValue = string | number | boolean | null | undefined;

/**
 * Get the current URLSearchParams from the browser
 */
const getCurrentSearchParams = (): URLSearchParams => {
  return new URLSearchParams(window.location.search);
};

/**
 * Get a search parameter value with optional default
 */
export const getSearchParam = (key: string, defaultValue?: string): string | undefined => {
  const searchParams = getCurrentSearchParams();
  return searchParams.get(key) ?? defaultValue;
};

/**
 * Get a search parameter as a number
 */
export const getSearchParamAsNumber = (key: string, defaultValue?: number): number | undefined => {
  const searchParams = getCurrentSearchParams();
  const value = searchParams.get(key);
  if (value === null) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get a search parameter as a boolean
 */
export const getSearchParamAsBoolean = (key: string, defaultValue?: boolean): boolean | undefined => {
  const searchParams = getCurrentSearchParams();
  const value = searchParams.get(key);
  if (value === null) return defaultValue;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  return defaultValue;
};

/**
 * Set multiple search parameters and update the URL
 */
export const setSearchParams = (params: Record<string, SearchParamValue>, replace: boolean = true): void => {
  const searchParams = getCurrentSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(value));
    }
  });

  const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  if (replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }
};

/**
 * Convert current search parameters to a plain object
 */
export const getSearchParamsObject = (): Record<string, string> => {
  const searchParams = getCurrentSearchParams();
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Remove specific search parameters and update the URL
 */
export const removeSearchParams = (keys: string[]): void => {
  const searchParams = getCurrentSearchParams();

  keys.forEach((key) => {
    searchParams.delete(key);
  });

  const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  window.history.replaceState({}, '', newUrl);
};
