<<<<<<< HEAD
import { type ErrorSeverity, type ErrorType, ERROR_SEVERITY, ERROR_TYPE } from '@/shared/constants';
=======
export type ErrorType = 'network' | 'validation' | 'permission' | 'unknown' | 'component_crash';
export type ErrorSeverity = 'critical' | 'warning' | 'info';

export const ERROR_TYPE = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown',
  COMPONENT_CRASH: 'component_crash',
} as const;

export const ERROR_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
} as const;
>>>>>>> 12e7163 (feat: add error boundary)

export interface AppError extends Error {
  severity: ErrorSeverity;
  type: ErrorType;
  code?: string;
  context?: Record<string, unknown>;
  timestamp: Date;
}

export class CriticalError extends Error implements AppError {
  severity = ERROR_SEVERITY.CRITICAL;
  type: ErrorType;
  code?: string;
  context?: Record<string, unknown>;
  timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ERROR_TYPE.UNKNOWN,
    code?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CriticalError';
    this.type = type;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class ExpectedError extends Error implements AppError {
  severity = ERROR_SEVERITY.WARNING;
  type: ErrorType;
  code?: string;
  context?: Record<string, unknown>;
  timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ERROR_TYPE.UNKNOWN,
    code?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ExpectedError';
    this.type = type;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

export const createError = (
  message: string,
  severity: ErrorSeverity,
  type: ErrorType = ERROR_TYPE.UNKNOWN,
  code?: string,
  context?: Record<string, unknown>
): AppError => {
  const ErrorClass = severity === ERROR_SEVERITY.CRITICAL ? CriticalError : ExpectedError;
  return new ErrorClass(message, type, code, context);
};

export const isCriticalError = (error: Error | AppError): error is CriticalError => {
  return error instanceof CriticalError || (error as AppError).severity === ERROR_SEVERITY.CRITICAL;
};
