
import { 
  ClassifiedError, 
  ErrorType
} from '@/lib/errorMonitoring/types/errorClassification';
import { createClassifiedError } from '@/lib/errorMonitoring/utils/errorClassifier';
import { IBKRErrorContext } from '../errorHandler';

/**
 * Specialized classifier for TWS-specific errors
 */
export function classifyTwsErrors(error: any, context: IBKRErrorContext): ClassifiedError | null {
  const message = error?.message || '';
  const lowerMessage = message.toLowerCase();
  
  // Only process TWS specific errors
  if (context.connectionMethod !== 'tws') {
    return null;
  }
  
  // TWS connection errors
  if (lowerMessage.includes('tws') && lowerMessage.includes('not running')) {
    return createClassifiedError(
      'Interactive Brokers Trader Workstation (TWS) is not running. Please start TWS and try again.',
      ErrorType.CONNECTION_REFUSED,
      { originalError: error }
    );
  }
  
  if (lowerMessage.includes('api connections disabled')) {
    return createClassifiedError(
      'API connections are disabled in TWS. Please enable API connections in TWS settings.',
      ErrorType.PERMISSION_DENIED,
      { originalError: error }
    );
  }
  
  if (lowerMessage.includes('port') && (lowerMessage.includes('in use') || lowerMessage.includes('unavailable'))) {
    return createClassifiedError(
      'TWS port is unavailable or in use. Please check your port configuration.',
      ErrorType.CONNECTION_REFUSED,
      { originalError: error }
    );
  }
  
  if (lowerMessage.includes('version mismatch')) {
    return createClassifiedError(
      'TWS version is incompatible. Please update either TWS or this application.',
      ErrorType.CLIENT_ERROR,
      { originalError: error }
    );
  }
  
  return null;
}
