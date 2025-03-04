
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
    
    // We'll set up global handlers after app is initialized
    setTimeout(() => {
      try {
        import('../handlers/globalErrorHandlers').then(module => {
          module.setupGlobalErrorHandling();
        }).catch(err => {
          console.error('Failed to load globalErrorHandlers:', err);
        });
        
        import('../handlers/performanceMonitoring').then(module => {
          module.setupPerformanceMonitoring();
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
