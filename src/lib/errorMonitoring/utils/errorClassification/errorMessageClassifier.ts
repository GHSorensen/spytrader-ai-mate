
import { ClassifiedError, ErrorType, ErrorCategory } from '../../types/errorClassification';

/**
 * Attempt to classify errors based on common error message patterns
 */
export function classifyErrorByMessage(message: string = '', error: ClassifiedError): void {
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
