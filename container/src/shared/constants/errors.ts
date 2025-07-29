export type ErrorType = 'network' | 'validation' | 'permission' | 'unknown' | 'component_crash' | 'api_error';
export type ErrorSeverity = 'critical' | 'warning' | 'info';

export const ERROR_TYPE = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown',
  COMPONENT_CRASH: 'component_crash',
  API_ERROR: 'api_error',
} as const;

export const ERROR_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
} as const;
