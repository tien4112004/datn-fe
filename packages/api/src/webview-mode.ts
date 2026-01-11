/**
 * Webview Mode Detection
 *
 * Provides utilities to detect if the app is running inside a mobile webview.
 * This is used to switch between cookie-based auth (web) and token-based auth (webview).
 */

const WEBVIEW_MODE_KEY = 'webview-mode';

/**
 * Check if running in webview mode.
 *
 * Webview mode is detected by:
 * 1. URL path contains '/embed/' (embed routes are webview-specific)
 * 2. Access token exists in localStorage (injected by mobile app)
 *
 * @returns true if in webview mode, false otherwise
 */
export function isWebviewMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if on an embed route
  const isEmbedRoute = window.location.pathname.includes('/embed/');

  // Check if access token exists in localStorage (injected by mobile app)
  const hasAccessToken = !!localStorage.getItem('access_token');

  // console.info('[Webview Mode Detection]', {
  //   pathname: window.location.pathname,
  //   isEmbedRoute,
  //   hasAccessToken,
  //   tokenLength: hasAccessToken ? localStorage.getItem('access_token')?.length : 0,
  //   isWebviewMode: isEmbedRoute && hasAccessToken,
  // });

  // Both conditions must be true
  return isEmbedRoute && hasAccessToken;
}

/**
 * Manually set webview mode (for testing or special cases).
 * This is stored in localStorage and takes precedence over auto-detection.
 *
 * @param enabled - true to enable webview mode, false to disable
 */
export function setWebviewMode(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (enabled) {
    localStorage.setItem(WEBVIEW_MODE_KEY, 'true');
  } else {
    localStorage.removeItem(WEBVIEW_MODE_KEY);
  }
}

/**
 * Check if webview mode was manually enabled.
 *
 * @returns true if manually enabled, false otherwise
 */
export function isWebviewModeManuallySet(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(WEBVIEW_MODE_KEY) === 'true';
}

/**
 * Get the appropriate API client based on current mode.
 * This is the main function to use when you need mode-aware API access.
 *
 * @returns 'webview' if in webview mode, 'default' otherwise
 */
export function getApiClientMode(): 'webview' | 'default' {
  // Manual override takes precedence
  if (isWebviewModeManuallySet()) {
    return 'webview';
  }

  return isWebviewMode() ? 'webview' : 'default';
}
