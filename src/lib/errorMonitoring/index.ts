
/**
 * Error monitoring system - main entry point
 * 
 * This module exports the main functions for error monitoring and tracking
 */

export { logError } from './logError';
export { trackEvent } from './trackEvent';
export { initErrorMonitoring } from './globalErrorHandling';
export type { ErrorContext, EventProperties } from './types';
