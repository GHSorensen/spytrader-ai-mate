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
 * Classify errors based on common network error codes
 */
function classifyErrorByCode(code: string, error: ClassifiedError): void {
  switch (code) {
    case 'ECONNREFUSED':
      error.category = ErrorCategory.CONNECTION;
      error.errorType = ErrorType.CONNECTION_REFUSED;
      break;
    case 'ECONNRESET':
      error.category = ErrorCategory.CONNECTION;
      error.errorType = ErrorType.CONNECTION_CLOSED;
      break;
    case 'ETIMEDOUT':
    case 'ESOCKETTIMEDOUT':
      error.category = ErrorCategory.TIMEOUT;
      error.errorType = ErrorType.CONNECTION_TIMEOUT;
      break;
    case 'ENOTFOUND':
      error.category = ErrorCategory.API;
      error.errorType = ErrorType.ENDPOINT_NOT_FOUND;
      break;
    case 'ECONNABORTED':
      error.category = ErrorCategory.CLIENT;
      error.errorType = ErrorType.ABORTED;
      break;
    case 'ENETUNREACH':
      error.category = ErrorCategory.CONNECTION;
      error.errorType = ErrorType.NETWORK_OFFLINE;
      break;
    // Add more codes as needed
  }
}

/**
 * Attempt to classify errors based on common error message patterns
 */
function classifyErrorByMessage(message: string = '', error: ClassifiedError): void {
  if (!message) return;
  
  const lowerMessage = message.toLowerCase();
  
  // Connection errors
  if (lowerMessage.includes('network') && lowerMessage.includes('offline')) {
    error.category = ErrorCategory.CONNECTION;
    error.errorType = ErrorType.NETWORK_OFFLINE;
  } 
  else if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    error.category = ErrorCategory.TIMEOUT;
    error.errorType = ErrorType.REQUEST_TIMEOUT;
  } 
  else if (lowerMessage.includes('connection refused')) {
    error.category = ErrorCategory.CONNECTION;
    error.errorType = ErrorType.CONNECTION_REFUSED;
  } 
  // Authentication errors
  else if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication failed')) {
    error.category = ErrorCategory.AUTHENTICATION;
    error.errorType = ErrorType.AUTH_INVALID;
  } 
  else if (lowerMessage.includes('token expired') || lowerMessage.includes('session expired')) {
    error.category = ErrorCategory.AUTHENTICATION;
    error.errorType = ErrorType.AUTH_EXPIRED;
  }
  // Permission errors
  else if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission denied')) {
    error.category = ErrorCategory.PERMISSION;
    error.errorType = ErrorType.PERMISSION_DENIED;
  }
  // Rate limiting errors
  else if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    error.category = ErrorCategory.RATE_LIMIT;
    error.errorType = ErrorType.RATE_LIMIT_EXCEEDED;
  }
  // API errors
  else if (lowerMessage.includes('not found') && (lowerMessage.includes('api') || lowerMessage.includes('endpoint'))) {
    error.category = ErrorCategory.API;
    error.errorType = ErrorType.ENDPOINT_NOT_FOUND;
  }
  else if (lowerMessage.includes('service unavailable')) {
    error.category = ErrorCategory.API;
    error.errorType = ErrorType.SERVICE_UNAVAILABLE;
  }
  // IBKR-specific errors
  else if (lowerMessage.includes('tws') && lowerMessage.includes('connection')) {
    error.category = ErrorCategory.CONNECTION;
    error.errorType = ErrorType.CONNECTION_REFUSED;
  }
  else if (lowerMessage.includes('ibkr') && lowerMessage.includes('auth')) {
    error.category = ErrorCategory.AUTHENTICATION;
    error.errorType = ErrorType.AUTH_REQUIRED;
  }
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

/**
 * Get the error category from an error type
 */
function getErrorCategoryFromType(errorType: ErrorType): ErrorCategory {
  switch (errorType) {
    case ErrorType.NETWORK_OFFLINE:
    case ErrorType.CONNECTION_REFUSED:
    case ErrorType.CONNECTION_TIMEOUT:
    case ErrorType.CONNECTION_CLOSED:
      return ErrorCategory.CONNECTION;
      
    case ErrorType.AUTH_EXPIRED:
    case ErrorType.AUTH_INVALID:
    case ErrorType.AUTH_MISSING:
    case ErrorType.AUTH_REQUIRED:
      return ErrorCategory.AUTHENTICATION;
      
    case ErrorType.PERMISSION_DENIED:
    case ErrorType.ACCOUNT_DISABLED:
    case ErrorType.SUBSCRIPTION_REQUIRED:
    case ErrorType.READ_ONLY_ACCESS:
      return ErrorCategory.PERMISSION;
      
    case ErrorType.INVALID_RESPONSE:
    case ErrorType.SCHEMA_VALIDATION:
    case ErrorType.MISSING_DATA:
    case ErrorType.DATA_CORRUPTED:
      return ErrorCategory.DATA;
      
    case ErrorType.RATE_LIMIT_EXCEEDED:
    case ErrorType.TOO_MANY_REQUESTS:
    case ErrorType.QUOTA_EXCEEDED:
      return ErrorCategory.RATE_LIMIT;
      
    case ErrorType.REQUEST_TIMEOUT:
    case ErrorType.RESPONSE_TIMEOUT:
    case ErrorType.GATEWAY_TIMEOUT:
      return ErrorCategory.TIMEOUT;
      
    case ErrorType.API_ERROR:
    case ErrorType.ENDPOINT_NOT_FOUND:
    case ErrorType.METHOD_NOT_ALLOWED:
    case ErrorType.SERVICE_UNAVAILABLE:
      return ErrorCategory.API;
      
    case ErrorType.INVALID_PARAMETERS:
    case ErrorType.CLIENT_ERROR:
    case ErrorType.ABORTED:
      return ErrorCategory.CLIENT;
      
    default:
      return ErrorCategory.UNKNOWN;
  }
}
