
/**
 * Global error handling setup
 */

import { isProduction } from '@/config/environment';
import { logError } from './logError';

/**
 * Enhanced global error handling for unhandled promise rejections
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
      
      // Track performance issues
      if ('PerformanceObserver' in window) {
        try {
          // Monitor long tasks (UI blocking)
          const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Only log truly problematic tasks (> 200ms)
              if (entry.duration > 200) {
                console.warn(
                  `Long task detected: ${entry.duration.toFixed(2)}ms`,
                  entry.name || 'Anonymous Task'
                );
                
                // For extremely long tasks, report as errors
                if (entry.duration > 1000) {
                  logError(
                    new Error(`UI Blocked: Long task took ${entry.duration.toFixed(2)}ms`),
                    { type: 'performanceIssue', severity: 'medium' }
                  );
                }
              }
            }
          });
          
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // Not all browsers support all performance APIs
          console.warn('Performance monitoring partially unavailable:', e);
        }
      }
      
      // Setup periodic health checks
      if (isProduction) {
        setInterval(() => {
          // Check memory usage
          if (performance && 'memory' in performance) {
            const memory = (performance as any).memory;
            if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
              logError(
                new Error('Memory usage critical'), 
                { 
                  type: 'memoryIssue', 
                  severity: 'high',
                  memory: {
                    used: memory.usedJSHeapSize,
                    total: memory.jsHeapSizeLimit,
                    percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2) + '%'
                  }
                }
              );
            }
          }
        }, 60000); // Check every minute
      }
    }
  } catch (err) {
    // Ensure any error in setup doesn't break the app
    console.error('Error setting up global error handling:', err);
  }
}

/**
 * Initialize the error monitoring system
 */
export function initErrorMonitoring(): void {
  try {
    // Set up global error handling
    setupGlobalErrorHandling();
    
    // Log initialization
    console.log(`Error monitoring initialized for ${isProduction ? 'production' : 'development'} environment`);
    
    // In production, we would initialize external services here
    if (isProduction) {
      // Initialize third-party services like Sentry
      // Example: Sentry.init({ dsn: config.sentryDsn });
    }
  } catch (err) {
    // Failsafe for errors in the error monitoring system itself
    console.error('Error initializing error monitoring:', err);
  }
}
