
/**
 * Error monitoring system initialization
 */

import { isProduction } from '@/config/environment';

/**
 * Initialize the error monitoring system
 */
export function initErrorMonitoring(): void {
  try {
    console.log(`Error monitoring initialized for ${isProduction ? 'production' : 'development'} environment`);
    
    // In production, we would initialize external services here
    if (isProduction) {
      // Initialize third-party services like Sentry
      // Example: Sentry.init({ dsn: config.sentryDsn });
    }
    
    // We'll set up global handlers, but only do it after the app is initialized
    // and make sure it doesn't crash the app if it fails
    setTimeout(() => {
      try {
        // Load modules dynamically to prevent startup issues
        import('../handlers/globalErrorHandlers').then(module => {
          try {
            module.setupGlobalErrorHandling();
          } catch (err) {
            console.error('Failed to setup global error handling:', err);
          }
        }).catch(err => {
          console.error('Failed to load globalErrorHandlers:', err);
        });
        
        import('../handlers/performanceMonitoring').then(module => {
          try {
            module.setupPerformanceMonitoring();
          } catch (err) {
            console.error('Failed to setup performance monitoring:', err);
          }
        }).catch(err => {
          console.error('Failed to load performanceMonitoring:', err);
        });
      } catch (err) {
        console.error('Error setting up monitoring handlers:', err);
      }
    }, 2000);
  } catch (err) {
    // Failsafe for errors in the error monitoring system itself
    console.error('Error initializing error monitoring:', err);
  }
}
