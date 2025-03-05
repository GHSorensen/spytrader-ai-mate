
/**
 * Error classification system for better error handling and reporting
 */

export { ErrorCategory } from './errorCategories';
export { ErrorType } from './errorTypes';
export {
  HTTP_STATUS_TO_CATEGORY,
  HTTP_STATUS_TO_ERROR_TYPE,
  ERROR_MESSAGES,
  RETRYABLE_ERROR_TYPES
} from './errorMappings';

// Extended error with classification
export interface ClassifiedError extends Error {
  category?: ErrorCategory;
  errorType?: ErrorType;
  status?: number;
  isClassified?: boolean;
  retryable?: boolean;
  originalError?: any;
}

/**
 * Options for error classification
 */
export interface ErrorClassificationOptions {
  // Default category if classification fails
  defaultCategory?: ErrorCategory;
  // Default type if classification fails
  defaultType?: ErrorType;
  // Whether to include the original error
  includeOriginalError?: boolean;
}
