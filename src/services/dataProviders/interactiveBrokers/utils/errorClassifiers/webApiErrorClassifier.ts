
import { 
  ClassifiedError, 
  ErrorType
} from '@/lib/errorMonitoring/types/errorClassification';
import { createClassifiedError } from '@/lib/errorMonitoring/utils/errorClassifier';
import { IBKRErrorContext } from '../errorHandler';

/**
 * Specialized classifier for WebAPI-specific errors
 */
export function classifyWebApiErrors(error: any, context: IBKRErrorContext): ClassifiedError | null {
  const message = error?.message || '';
  const lowerMessage = message.toLowerCase();
  
  // Only process WebAPI specific errors
  if (context.connectionMethod !== 'webapi') {
    return null;
  }
  
  // Common SSO errors
  if (lowerMessage.includes('sso validation') || lowerMessage.includes('oauth')) {
    return createClassifiedError(
      'Authentication error with Interactive Brokers. Please re-authorize the application.',
      ErrorType.AUTH_INVALID,
      { originalError: error }
    );
  }
  
  // Token errors
  if (lowerMessage.includes('token expired') || lowerMessage.includes('invalid token')) {
    return createClassifiedError(
      'Your Interactive Brokers session has expired. Please log in again.',
      ErrorType.AUTH_EXPIRED,
      { originalError: error }
    );
  }
  
  // API key errors
  if (lowerMessage.includes('api key') && lowerMessage.includes('invalid')) {
    return createClassifiedError(
      'Invalid API key for Interactive Brokers. Please check your API key configuration.',
      ErrorType.AUTH_INVALID,
      { originalError: error }
    );
  }
  
  // Rate limiting
  if (lowerMessage.includes('too many requests') || lowerMessage.includes('rate limit')) {
    return createClassifiedError(
      'You have reached the rate limit for Interactive Brokers API. Please try again later.',
      ErrorType.RATE_LIMIT_EXCEEDED,
      { originalError: error, status: 429 }
    );
  }
  
  return null;
}
