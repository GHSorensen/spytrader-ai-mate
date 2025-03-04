
/**
 * Enhanced error logging implementation
 */

import { config, environment, isProduction } from '@/config/environment';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ErrorContext } from '../types';
import { 
  getErrorHash, 
  reportedErrors, 
  ERROR_SAMPLING_RATE, 
  MAX_STORED_ERRORS,
  getErrorCount,
  incrementErrorCount,
  resetErrorCount
} from '../utils/errorUtils';

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
    
    // Get current user if available
    if (typeof window !== 'undefined') {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          enhancedContext.userId = data.session.user.id;
        }
      }).catch(() => {
        // Ignore auth errors in error logging
      });
    }
    
    // Generate error hash for deduplication
    const errorHash = getErrorHash(error, enhancedContext);
    
    // Check if this exact error was already reported
    if (reportedErrors.has(errorHash)) {
      // Just log a condensed version if we've seen it before
      if (!isProduction) {
        console.warn('[DUPLICATE ERROR]', error.message, '(suppressed full details)');
      }
      return;
    }
    
    // Apply sampling for production
    const shouldSample = Math.random() < ERROR_SAMPLING_RATE;
    
    // Store hash to avoid reporting duplicates
    reportedErrors.add(errorHash);
    incrementErrorCount();
    
    // Rotate error cache if it gets too large
    if (getErrorCount() > MAX_STORED_ERRORS) {
      reportedErrors.clear();
      resetErrorCount();
    }
    
    // Always log in development
    if (!isProduction) {
      console.error(
        '[DEV ERROR]',
        error.message,
        enhancedContext,
        error.stack
      );
      
      // Show toast in development for visibility
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } 
    // In production, log and maybe send to monitoring service
    else if (shouldSample) {
      // In real app, send to error monitoring service
      // Example: Sentry.captureException(error, { extra: enhancedContext });
      
      // Also log to console in an easily identifiable format
      console.error(
        '%c[PRODUCTION ERROR]%c',
        'background: #f44336; color: white; padding: 2px 4px; border-radius: 4px; font-weight: bold;',
        '',
        `[${enhancedContext.severity || 'medium'}]`,
        error.message,
        enhancedContext,
        error.stack
      );
      
      // For critical errors in production, show user feedback
      if (enhancedContext.severity === 'critical') {
        toast({
          variant: 'destructive',
          title: 'Unexpected Error',
          description: 'An error occurred. Our team has been notified.',
        });
      }
    }
  } catch (loggingError) {
    // Failsafe for errors in error logging
    console.error('Error in error logging system:', loggingError);
  }
}
