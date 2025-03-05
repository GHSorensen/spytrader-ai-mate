import { 
  ClassifiedError, 
  ErrorCategory, 
  ErrorType, 
  HTTP_STATUS_TO_CATEGORY, 
  HTTP_STATUS_TO_ERROR_TYPE,
  ERROR_MESSAGES,
  RETRYABLE_ERROR_TYPES,
  ErrorClassificationOptions
} from '../types/errorClassification';
import { classifyErrorByCode } from './errorClassification/errorCodeClassifier';
import { classifyErrorByMessage } from './errorClassification/errorMessageClassifier';
import { getErrorCategoryFromType } from './errorClassification/categoryMapper';

/**
 * Classifies an error based on its properties and content
 */
export function classifyError(
  error: any, 
  options: ErrorClassificationOptions = {}
): ClassifiedError {
  const {
    defaultCategory = ErrorCategory.UNKNOWN,
    defaultType = ErrorType.UNKNOWN,
    includeOriginalError = true
  } = options;

  // If error is already classified, return it
  if ((error as ClassifiedError).isClassified) {
    return error as ClassifiedError;
  }

  // Start with a new error to ensure we have a clean slate
  const classifiedError: ClassifiedError = new Error(
    error?.message || 'An error occurred'
  ) as ClassifiedError;
  
  // Copy stack trace if available
  if (error?.stack) {
    classifiedError.stack = error.stack;
  }
  
  // Copy name if available
  if (error?.name) {
    classifiedError.name = error.name;
  }

  // If original error has a status code, use it for classification
  if (error?.status) {
    classifiedError.status = error.status;
    classifiedError.category = HTTP_STATUS_TO_CATEGORY[error.status] || defaultCategory;
    classifiedError.errorType = HTTP_STATUS_TO_ERROR_TYPE[error.status] || defaultType;
  } 
  // Also check for statusCode which some libraries use
  else if (error?.statusCode) {
    classifiedError.status = error.statusCode;
    classifiedError.category = HTTP_STATUS_TO_CATEGORY[error.statusCode] || defaultCategory;
    classifiedError.errorType = HTTP_STATUS_TO_ERROR_TYPE[error.statusCode] || defaultType;
  }
  // Check for code which is used by some network errors 
  else if (error?.code) {
    classifyErrorByCode(error.code, classifiedError);
  } 
  // Check for response object which might have status
  else if (error?.response?.status) {
    classifiedError.status = error.response.status;
    classifiedError.category = HTTP_STATUS_TO_CATEGORY[error.response.status] || defaultCategory;
    classifiedError.errorType = HTTP_STATUS_TO_ERROR_TYPE[error.response.status] || defaultType;
  } 
  // Classify by error message if we couldn't classify by status or code
  else {
    classifyErrorByMessage(error?.message, classifiedError);
  }
  
  // If we still don't have a category/type, use defaults
  if (!classifiedError.category) classifiedError.category = defaultCategory;
  if (!classifiedError.errorType) classifiedError.errorType = defaultType;
  
  // Set user-friendly message based on error type
  if (classifiedError.errorType && ERROR_MESSAGES[classifiedError.errorType]) {
    classifiedError.message = ERROR_MESSAGES[classifiedError.errorType];
  }
  
  // Set retryable flag based on error type
  classifiedError.retryable = classifiedError.errorType
    ? RETRYABLE_ERROR_TYPES.has(classifiedError.errorType)
    : false;
  
  // Include original error if requested
  if (includeOriginalError) {
    classifiedError.originalError = error;
  }
  
  // Mark as classified
  classifiedError.isClassified = true;
  
  return classifiedError;
}

/**
 * Extract a user-friendly message from an error
 */
export function getUserFriendlyMessage(error: any): string {
  // If already classified, return the message (which should be user friendly)
  if ((error as ClassifiedError).isClassified) {
    return error.message;
  }
  
  // Otherwise classify it and return the message
  const classified = classifyError(error);
  return classified.message;
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // If already classified, check its retryable flag
  if ((error as ClassifiedError).isClassified) {
    return (error as ClassifiedError).retryable || false;
  }
  
  // Otherwise classify it and check its retryable flag
  const classified = classifyError(error);
  return classified.retryable || false;
}

/**
 * Create a new classified error
 */
export function createClassifiedError(
  message: string,
  errorType: ErrorType,
  options: {
    status?: number;
    originalError?: any;
  } = {}
): ClassifiedError {
  const error = new Error(message) as ClassifiedError;
  
  error.errorType = errorType;
  error.category = getErrorCategoryFromType(errorType);
  error.status = options.status;
  error.retryable = RETRYABLE_ERROR_TYPES.has(errorType);
  error.isClassified = true;
  
  if (options.originalError) {
    error.originalError = options.originalError;
  }
  
  return error;
}
