
import { 
  classifyError, 
  createClassifiedError, 
  isRetryableError 
} from '@/lib/errorMonitoring/utils/errorClassifier';
import { 
  ErrorType, 
  ClassifiedError,
  ErrorCategory 
} from '@/lib/errorMonitoring/types/errorClassification';
import { logError } from '@/lib/errorMonitoring/core/logger';

/**
 * Context for IBKR errors
 */
export interface IBKRErrorContext {
  service: string;
  method: string;
  connectionMethod?: 'webapi' | 'tws';
  paperTrading?: boolean;
  [key: string]: any;
}

/**
 * Handle IBKR-specific errors with classification and logging
 */
export function handleIBKRError(error: any, context: IBKRErrorContext): ClassifiedError {
  try {
    console.error(`[IBKR Error] in ${context.service}.${context.method}:`, error);
    
    // First, check if the error is IBKR-specific and needs special handling
    const ibkrError = classifyIBKRError(error, context);
    
    // Log the error with enhanced context
    logError(ibkrError, {
      service: context.service,
      method: context.method,
      connectionMethod: context.connectionMethod,
      paperTrading: context.paperTrading,
      ...context
    });
    
    return ibkrError;
  } catch (handlingError) {
    console.error('Error in IBKR error handler:', handlingError);
    return classifyError(error);
  }
}

/**
 * Classify IBKR-specific errors
 */
function classifyIBKRError(error: any, context: IBKRErrorContext): ClassifiedError {
  // Get the error message, defaulting to empty string if not present
  const message = error?.message || '';
  const lowerMessage = message.toLowerCase();
  
  // TWS-specific error handling
  if (context.connectionMethod === 'tws') {
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
  }
  
  // WebAPI-specific error handling
  if (context.connectionMethod === 'webapi') {
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
  }
  
  // Market data specific errors
  if (context.method.includes('marketData') || context.method.includes('getMarketData')) {
    if (lowerMessage.includes('market data subscription')) {
      return createClassifiedError(
        'Market data subscription required. Please check your Interactive Brokers market data subscriptions.',
        ErrorType.SUBSCRIPTION_REQUIRED,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('no market data permissions')) {
      return createClassifiedError(
        'No market data permissions. Please check your Interactive Brokers market data subscriptions.',
        ErrorType.PERMISSION_DENIED,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('symbol not found') || lowerMessage.includes('unknown symbol')) {
      return createClassifiedError(
        'Symbol not found. Please check the ticker symbol.',
        ErrorType.INVALID_PARAMETERS,
        { originalError: error }
      );
    }
  }
  
  // Options chain specific errors
  if (context.method.includes('optionChain') || context.method.includes('getOptions')) {
    if (lowerMessage.includes('no options data')) {
      return createClassifiedError(
        'No options data available for this symbol.',
        ErrorType.MISSING_DATA,
        { originalError: error }
      );
    }
  }
  
  // Trade execution specific errors
  if (context.method.includes('placeTrade') || context.method.includes('executeTrade')) {
    if (lowerMessage.includes('insufficient funds') || lowerMessage.includes('buying power')) {
      return createClassifiedError(
        'Insufficient funds to execute this trade.',
        ErrorType.PERMISSION_DENIED,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('invalid order')) {
      return createClassifiedError(
        'Invalid order parameters. Please check your trade details.',
        ErrorType.INVALID_PARAMETERS,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('market closed') || lowerMessage.includes('outside trading hours')) {
      return createClassifiedError(
        'Market is closed. This order will be submitted when the market opens.',
        ErrorType.API_ERROR,
        { originalError: error }
      );
    }
  }
  
  // If we couldn't classify it as an IBKR-specific error, use generic classification
  return classifyError(error);
}

/**
 * Check if an IBKR error is retryable
 */
export function isIBKRErrorRetryable(error: any): boolean {
  // Use the general retryable check
  return isRetryableError(error);
}

/**
 * Get appropriate retry delay based on error type
 */
export function getIBKRErrorRetryDelay(error: ClassifiedError, attemptNumber: number): number {
  const baseDelay = 1000; // Base delay of 1 second
  
  // For rate limiting, use exponential backoff with longer delays
  if (error.errorType === ErrorType.RATE_LIMIT_EXCEEDED) {
    return Math.min(30000, baseDelay * Math.pow(2, attemptNumber + 1));
  }
  
  // For network issues, use shorter delays
  if (error.category === ErrorCategory.CONNECTION) {
    return Math.min(10000, baseDelay * Math.pow(1.5, attemptNumber));
  }
  
  // For timeout issues
  if (error.category === ErrorCategory.TIMEOUT) {
    return Math.min(15000, baseDelay * Math.pow(1.5, attemptNumber)); 
  }
  
  // Default exponential backoff
  return Math.min(20000, baseDelay * Math.pow(1.8, attemptNumber));
}
