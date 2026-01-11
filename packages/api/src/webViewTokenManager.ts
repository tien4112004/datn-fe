/**
 * Token manager for WebView API authentication
 * Stores and manages Bearer tokens received from Flutter
 */
class WebViewTokenManager {
  private token: string | null = null;

  /**
   * Set the authentication token
   * Called when Flutter provides a token
   */
  setToken(token: string | null) {
    this.token = token;
    console.log('[WebViewTokenManager] Token set:', token ? 'Token received' : 'Token cleared');
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear the authentication token
   */
  clearToken() {
    this.token = null;
    console.log('[WebViewTokenManager] Token cleared');
  }

  /**
   * Check if a token is currently set
   */
  hasToken(): boolean {
    return this.token !== null;
  }
}

// Export singleton instance
export const webViewTokenManager = new WebViewTokenManager();
