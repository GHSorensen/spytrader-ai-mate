
/**
 * Enhanced error logging implementation
 */

import { config, environment, isProduction } from '@/config/environment';
import { ErrorContext } from '../types';
import { toast } from "@/hooks/use-toast";
import { classifyError, getUserFriendlyMessage } from '../utils/errorClassifier';
import { ClassifiedError, ErrorCategory } from '../types/errorClassification';

/**
 * Log errors to console in development and to monitoring service in production
 * with deduplication, sampling, and error classification
 */
export function logError(error: Error, context?: ErrorContext): void {
  try {
    // Add timestamp and environment to context
    const enhancedContext = {
      ...context,
      timestamp: new Date().toISOString(),
      environment,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    
    // Classify the error to get better error information
    const classifiedError = classifyError(error);
    
    // Add classification to context
    const classifiedContext = {
      ...enhancedContext,
      errorCategory: classifiedError.category,
      errorType: classifiedError.errorType,
      status: classifiedError.status,
      retryable: classifiedError.retryable
    };
    
    // Always log in development
    if (!isProduction) {
      console.error(
        '[DEV ERROR]',
        classifiedError.message,
        classifiedContext,
        classifiedError.stack
      );
      
      // Show toast in development for immediate feedback
      try {
        showErrorToast(classifiedError);
      } catch (e) {
        console.error('Failed to show error toast:', e);
      }
    } 
    // In production, log and maybe send to monitoring service
    else {
      // In real app, send to error monitoring service
      // Example: Sentry.captureException(error, { extra: classifiedContext });
      
      // Also log to console in an easily identifiable format
      console.error(
        '[PRODUCTION ERROR]',
        classifiedError.message,
        classifiedContext,
        classifiedError.stack
      );
      
      // In production, only show toast for certain error categories
      if (shouldShowErrorToast(classifiedError)) {
        try {
          showErrorToast(classifiedError);
        } catch (e) {
          console.error('Failed to show error toast:', e);
        }
      }
    }
  } catch (loggingError) {
    // Failsafe for errors in error logging
    console.error('Error in error logging system:', loggingError);
  }
}

/**
 * Determine if an error toast should be shown to the user
 */
function shouldShowErrorToast(error: ClassifiedError): boolean {
  // Always show connection, authentication, and permission errors
  if (
    error.category === ErrorCategory.CONNECTION ||
    error.category === ErrorCategory.AUTHENTICATION ||
    error.category === ErrorCategory.PERMISSION
  ) {
    return true;
  }
  
  // For other categories, be more selective
  // Don't show every single timeout or API error in production
  if (error.category === ErrorCategory.TIMEOUT || error.category === ErrorCategory.API) {
    // Maybe check error frequency or other conditions
    return false;
  }
  
  // Always show rate limiting errors as the user needs to know
  if (error.category === ErrorCategory.RATE_LIMIT) {
    return true;
  }
  
  // For other categories, default to false in production
  return !isProduction;
}

/**
 * Show an error toast with user-friendly messaging
 */
export const showErrorToast = (error: Error | ClassifiedError, details?: string) => {
  try {
    if (typeof window !== 'undefined') {
      // Get user-friendly message
      let message: string;
      
      if ((error as ClassifiedError).isClassified) {
        message = error.message;
      } else {
        message = getUserFriendlyMessage(error);
      }
      
      // Show toast with different variants based on error category
      let variant: 'default' | 'destructive' | 'warning' = 'destructive';
      
      if ((error as ClassifiedError).category === ErrorCategory.RATE_LIMIT) {
        variant = 'warning';
      }
      
      toast({
        title: 'An error occurred',
        description: details ? `${message}: ${details}` : message,
        variant,
      });
    }
  } catch (e) {
    console.error('Failed to show error toast', e);
  }
};
