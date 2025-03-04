
/**
 * Error monitoring utility for production environment
 * 
 * This module provides centralized error logging and monitoring capabilities.
 * In a real-world scenario, you would integrate with services like Sentry,
 * LogRocket, or other error monitoring platforms.
 */

// Determine if we're in production environment
const isProduction = import.meta.env.PROD;

/**
 * Log errors to console in development and to monitoring service in production
 */
export function logError(error: Error, context?: Record<string, any>): void {
  if (isProduction) {
    // In a real app, you would send to a monitoring service here
    // Example: Sentry.captureException(error, { extra: context });
    
    // For now, we'll just log to console in a formatted way
    console.error(
      '%c[PRODUCTION ERROR]%c',
      'background: #f44336; color: white; padding: 2px 4px; border-radius: 4px; font-weight: bold;',
      '',
      error.message,
      context,
      error.stack
    );
  } else {
    // Development logging
    console.error('[DEV ERROR]', error.message, context, error.stack);
  }
}

/**
 * Track a user action or event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  if (isProduction) {
    // In a real app, you would send to an analytics service
    // Example: mixpanel.track(eventName, properties);
    console.info(
      '%c[EVENT]%c',
      'background: #2196f3; color: white; padding: 2px 4px; border-radius: 4px; font-weight: bold;',
      '',
      eventName,
      properties
    );
  } else {
    // Development logging
    console.info('[DEV EVENT]', eventName, properties);
  }
}

/**
 * Global error handling for unhandled promise rejections
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        { reason: event.reason }
      );
    });

    window.addEventListener('error', (event) => {
      logError(
        new Error(`Uncaught error: ${event.message}`),
        { 
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error 
        }
      );
    });
  }
}
