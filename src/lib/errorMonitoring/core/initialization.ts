
/**
 * Error monitoring system initialization
 */

import { isProduction } from '@/config/environment';
import { setupGlobalErrorHandling } from '../handlers/globalErrorHandlers';
import { setupPerformanceMonitoring } from '../handlers/performanceMonitoring';

/**
 * Initialize the error monitoring system
 */
export function initErrorMonitoring(): void {
  try {
    // Set up global error handling
    setupGlobalErrorHandling();
    
    // Set up performance monitoring
    setupPerformanceMonitoring();
    
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
