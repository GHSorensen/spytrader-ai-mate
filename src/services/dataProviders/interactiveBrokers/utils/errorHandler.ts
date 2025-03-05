
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
import { classifyIBKRErrorWithSpecializers } from './errorClassifiers';

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
    
    // First, try with our specialized IBKR error classifiers
    const ibkrError = classifyIBKRErrorWithSpecializers(error, context) || classifyError(error);
    
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
