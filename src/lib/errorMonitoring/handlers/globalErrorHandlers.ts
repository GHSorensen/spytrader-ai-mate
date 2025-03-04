
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
        try {
          const error = event.reason instanceof Error 
            ? event.reason 
            : new Error(`Unhandled promise rejection: ${String(event.reason)}`);
          
          logError(error, { 
            type: 'unhandledRejection',
            severity: 'high',
            isPromise: true
          });
        } catch (e) {
          console.error('Error in unhandledrejection handler:', e);
        }
      });

      // Handle uncaught errors
      window.addEventListener('error', (event) => {
        try {
          // Prevent logging the same error twice
          if (event.error) {
            // Do not call preventDefault() as it might break other error handlers
            // event.preventDefault();
            
            logError(event.error, { 
              type: 'uncaughtError',
              severity: 'high',
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
            });
          }
        } catch (e) {
          console.error('Error in error event handler:', e);
        }
      });
    }
  } catch (err) {
    // Ensure any error in setup doesn't break the app
    console.error('Error setting up global error handling:', err);
  }
}
