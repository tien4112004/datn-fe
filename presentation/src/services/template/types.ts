import type { SlideTemplate } from '@aiprimary/core';
import type { ApiService } from '@aiprimary/api';

export interface ITemplateApi extends ApiService {
  /**
   * Get all slide templates from the backend
   */
  getSlideTemplates(): Promise<SlideTemplate[]>;

  /**
   * Get slide templates filtered by layout type
   */
  getSlideTemplatesByLayout(layoutType: string): Promise<SlideTemplate[]>;
}
