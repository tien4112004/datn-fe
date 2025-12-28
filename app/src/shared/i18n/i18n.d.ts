/**
 * Type definitions for i18n translations
 * This provides autocomplete and type safety when using translations
 */

import 'i18next';
import common from './locales/en/common';
import glossary from './locales/en/glossary';
import errors from './locales/en/errors';
import auth from './locales/en/auth';

import presentation from './locales/en/presentation';
import mindmap from './locales/en/mindmap';
import image from './locales/en/image';
import projects from './locales/en/projects';
import settings from './locales/en/settings';
import classes from './locales/en/classes';
import assignment from './locales/en/assignment';
import examMatrix from './locales/en/examMatrix';

/**
 * Resources type based on English translations
 * Updated with examMatrix namespace
 */
export interface Resources {
  common: typeof common;
  glossary: typeof glossary;
  errors: typeof errors;
  auth: typeof auth;

  presentation: typeof presentation;
  mindmap: typeof mindmap;
  image: typeof image;
  projects: typeof projects;
  settings: typeof settings;
  classes: typeof classes;
  assignment: typeof assignment;
  examMatrix: typeof examMatrix;
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: Resources;
    // Return type for t() function
    returnNull: false;
  }
}
