/**
 * Types for theme description service
 */

export interface ThemeDescriptionRequest {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface ThemeDescriptionResponse {
  description: string;
}
