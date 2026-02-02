import type { ApiClient } from './client';
import api from './client';
import webViewApi from './webViewClient';

/**
 * Check if running in a WebView context (Flutter InAppWebView or VS Code)
 */
export function isWebViewContext(): boolean {
  if (typeof window === 'undefined') return false;
  // Flutter InAppWebView
  if ((window as any).flutter_inappwebview) return true;
  // VS Code WebView
  if ((window as any).acquireVsCodeApi) return true;
  return false;
}

/**
 * Get the default API client for the current environment
 * Automatically detects webview context and returns appropriate client
 */
export function getDefaultApiClient(): ApiClient {
  if (isWebViewContext()) {
    return webViewApi as ApiClient;
  }
  return api;
}

/**
 * Base interface for all services (simplified - no getType needed)
 * Services using dependency injection pattern should implement this
 */
export interface BaseService {
  readonly baseUrl: string;
}
