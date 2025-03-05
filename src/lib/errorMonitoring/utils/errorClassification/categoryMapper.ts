
import { ErrorCategory, ErrorType } from '../../types/errorClassification';

/**
 * Get the error category from an error type
 */
export function getErrorCategoryFromType(errorType: ErrorType): ErrorCategory {
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
