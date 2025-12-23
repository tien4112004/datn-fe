import { API_MODE } from '@aiprimary/api';
import type { SlideTemplate } from '@aiprimary/core';
import type { ITemplateApi } from './types';
import {
  labeledListTemplates,
  listTemplates,
  mainImageTemplates,
  pyramidTemplates,
  tableOfContentsTemplates,
  timelineTemplates,
  titleTemplates,
  twoColumnTemplates,
  twoColumnWithImageTemplates,
} from '@aiprimary/frontend-data';

// Collect all mock templates
const ALL_MOCK_TEMPLATES: SlideTemplate[] = [
  ...labeledListTemplates,
  ...listTemplates,
  ...mainImageTemplates,
  ...pyramidTemplates,
  ...tableOfContentsTemplates,
  ...timelineTemplates,
  ...titleTemplates,
  ...twoColumnTemplates,
  ...twoColumnWithImageTemplates,
];

export class MockTemplateApiService implements ITemplateApi {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType() {
    return API_MODE.mock;
  }

  async getSlideTemplates(): Promise<SlideTemplate[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ALL_MOCK_TEMPLATES;
  }

  async getSlideTemplatesByLayout(layoutType: string): Promise<SlideTemplate[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ALL_MOCK_TEMPLATES.filter((template) => template.layout === layoutType);
  }
}
