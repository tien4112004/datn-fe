export const ERROR_TYPE = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown',
  COMPONENT_CRASH: 'component_crash',
  API_ERROR: 'api_error',
  RESOURCE_NOT_FOUND: 'resource_not_found',
} as const;

export type ErrorType = (typeof ERROR_TYPE)[keyof typeof ERROR_TYPE];

export const ERROR_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ErrorSeverity = (typeof ERROR_SEVERITY)[keyof typeof ERROR_SEVERITY];
