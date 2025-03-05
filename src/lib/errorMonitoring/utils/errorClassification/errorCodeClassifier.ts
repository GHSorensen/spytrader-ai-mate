
import { ClassifiedError, ErrorType } from '../../types/errorClassification';

/**
 * Classify errors based on common network error codes
 */
export function classifyErrorByCode(code: string, error: ClassifiedError): void {
  switch (code) {
    case 'ECONNREFUSED':
      error.category = 'connection';
      error.errorType = ErrorType.CONNECTION_REFUSED;
      break;
    case 'ECONNRESET':
      error.category = 'connection';
      error.errorType = ErrorType.CONNECTION_CLOSED;
      break;
    case 'ETIMEDOUT':
    case 'ESOCKETTIMEDOUT':
      error.category = 'timeout';
      error.errorType = ErrorType.CONNECTION_TIMEOUT;
      break;
    case 'ENOTFOUND':
      error.category = 'api';
      error.errorType = ErrorType.ENDPOINT_NOT_FOUND;
      break;
    case 'ECONNABORTED':
      error.category = 'client';
      error.errorType = ErrorType.ABORTED;
      break;
    case 'ENETUNREACH':
      error.category = 'connection';
      error.errorType = ErrorType.NETWORK_OFFLINE;
      break;
    // Add more codes as needed
  }
}
