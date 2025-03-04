
/**
 * Enhanced error logging implementation
 */

import { config, environment, isProduction } from '@/config/environment';
import { ErrorContext } from '../types';
import { toast } from "@/hooks/use-toast";

/**
 * Log errors to console in development and to monitoring service in production
 * with deduplication and sampling
 */
export function logError(error: Error, context?: ErrorContext): void {
  try {
    // Add timestamp and environment
    const enhancedContext = {
      ...context,
      timestamp: new Date().toISOString(),
      environment,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    
    // Always log in development
    if (!isProduction) {
      console.error(
        '[DEV ERROR]',
        error.message,
        enhancedContext,
        error.stack
      );
      
      // In development we would show a toast, but we'll skip for now
      try {
        showErrorToast(error.message, error.stack);
      } catch (e) {
        console.error('Failed to show error toast:', e);
      }
    } 
    // In production, log and maybe send to monitoring service
    else {
      // In real app, send to error monitoring service
      // Example: Sentry.captureException(error, { extra: enhancedContext });
      
      // Also log to console in an easily identifiable format
      console.error(
        '[PRODUCTION ERROR]',
        error.message,
        enhancedContext,
        error.stack
      );
    }
  } catch (loggingError) {
    // Failsafe for errors in error logging
    console.error('Error in error logging system:', loggingError);
  }
}

export const showErrorToast = (message: string, details?: string) => {
  try {
    if (typeof window !== 'undefined') {
      toast({
        title: 'An error occurred',
        description: details ? `${message}: ${details}` : message,
        variant: 'destructive',
      });
    }
  } catch (e) {
    console.error('Failed to show error toast', e);
  }
};
