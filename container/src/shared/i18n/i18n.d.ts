/**
 * Type definitions for i18n translations
 * This provides autocomplete and type safety when using translations
 */

import 'i18next';
import common from './locales/en/common';
import glossary from './locales/en/glossary';
import errors from './locales/en/errors';

import presentation from './locales/en/presentation';
import mindmap from './locales/en/mindmap';
import image from './locales/en/image';
import projects from './locales/en/projects';
import settings from './locales/en/settings';
import classes from './locales/en/classes';

/**
 * Resources type based on English translations
 */
export interface Resources {
  common: typeof common;
  glossary: typeof glossary;
  errors: typeof errors;

  presentation: typeof presentation;
  mindmap: typeof mindmap;
  image: typeof image;
  projects: typeof projects;
  settings: typeof settings;
  classes: typeof classes;
}

/**
 * Extend i18next types for autocomplete support
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: Resources;
    // Return type for t() function
    returnNull: false;
  }
}
