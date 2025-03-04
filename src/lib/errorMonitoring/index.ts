
/**
 * Error monitoring system - main entry point
 * 
 * This module exports the main functions for error monitoring and tracking
 */

// Core functionality
export { logError } from './core/logger';
export { trackEvent } from './core/trackEvent';
export { initErrorMonitoring } from './core/initialization';

// Utilities
export { 
  getErrorHash, 
  reportedErrors,
  getErrorCount,
  incrementErrorCount,
  resetErrorCount,
  ERROR_SAMPLING_RATE,
  MAX_STORED_ERRORS
} from './utils/errorUtils';

// Monitoring and handling
export { setupGlobalErrorHandling } from './handlers/globalErrorHandlers';
export { setupPerformanceMonitoring } from './handlers/performanceMonitoring';

// Types
export type { ErrorContext, EventProperties } from './types';
