
import { ClassifiedError, ErrorType, ErrorCategory } from '../../types/errorClassification';

/**
 * Classify errors based on common network error codes
 */
export function classifyErrorByCode(code: string, error: ClassifiedError): void {
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
