
/**
 * Global error handling setup
 */

import { isProduction } from '@/config/environment';
import { logError } from '../core/logger';

/**
 * Set up global error handling for unhandled promise rejections
 * and unexpected errors
 */
export function setupGlobalErrorHandling(): void {
  try {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error 
          ? event.reason 
          : new Error(`Unhandled promise rejection: ${String(event.reason)}`);
        
        logError(error, { 
          type: 'unhandledRejection',
          severity: 'high',
          isPromise: true
        });
      });

      // Handle uncaught errors
      window.addEventListener('error', (event) => {
        // Prevent logging the same error twice
        if (event.error) {
          event.preventDefault();
          
          logError(event.error, { 
            type: 'uncaughtError',
            severity: 'high',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          });
        }
      });
      
      // Log navigation errors
      const originalPushState = history.pushState;
      history.pushState = function() {
        try {
          return originalPushState.apply(this, arguments as any);
        } catch (e) {
          logError(e as Error, { type: 'navigationError' });
          throw e;
        }
      };
    }
  } catch (err) {
    // Ensure any error in setup doesn't break the app
    console.error('Error setting up global error handling:', err);
  }
}
