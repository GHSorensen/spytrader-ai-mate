
/**
 * Utility functions for error monitoring
 */

import { ErrorContext } from './types';
import { isProduction } from '@/config/environment';

// Error storage to avoid duplicate reports
export const reportedErrors = new Set<string>();
export const MAX_STORED_ERRORS = 100;
export let errorCount = 0;

// Error sampling rate for high-frequency errors (only send some to server)
export const ERROR_SAMPLING_RATE = isProduction ? 0.1 : 1.0; // 10% in production, 100% in dev

/**
 * Generate a unique hash for an error to avoid duplicates
 */
export function getErrorHash(error: Error, context?: ErrorContext): string {
  const stack = error.stack ? error.stack.split('\n').slice(0, 3).join('') : '';
  const contextStr = context ? JSON.stringify(Object.values(context).sort()) : '';
  return `${error.message}:${stack}:${contextStr}`;
}
