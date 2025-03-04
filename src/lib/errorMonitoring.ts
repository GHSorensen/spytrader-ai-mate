
/**
 * Enhanced error monitoring utility for production environment
 * 
 * This module provides centralized error logging and monitoring capabilities
 * with additional production-focused features like error grouping,
 * sampling, and context preservation.
 */

import { config, environment, isProduction } from '@/config/environment';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interface for error metadata
interface ErrorContext {
  [key: string]: any;
  userId?: string;
  sessionId?: string;
  component?: string;
  route?: string;
  tags?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Track event interface
interface EventProperties {
  timestamp: string;
  environment: string;
  sessionId?: string;
  userId?: string;
  [key: string]: any;
}

// Error storage to avoid duplicate reports
const reportedErrors = new Set<string>();
const MAX_STORED_ERRORS = 100;
let errorCount = 0;

// Error sampling rate for high-frequency errors (only send some to server)
const ERROR_SAMPLING_RATE = isProduction ? 0.1 : 1.0; // 10% in production, 100% in dev

/**
 * Generate a unique hash for an error to avoid duplicates
 */
function getErrorHash(error: Error, context?: ErrorContext): string {
  const stack = error.stack ? error.stack.split('\n').slice(0, 3).join('') : '';
  const contextStr = context ? JSON.stringify(Object.values(context).sort()) : '';
  return `${error.message}:${stack}:${contextStr}`;
}

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
    errorCount++;
    
    // Rotate error cache if it gets too large
    if (errorCount > MAX_STORED_ERRORS) {
      reportedErrors.clear();
      errorCount = 0;
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

/**
 * Track a user action or event with enhanced context
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  try {
    const enhancedProps: EventProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      environment,
      sessionId: properties?.sessionId || `session_${Math.random().toString(36).substring(2, 9)}`,
    };
    
    // Get current user if available
    if (typeof window !== 'undefined') {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          enhancedProps.userId = data.session.user.id;
        }
        
        if (isProduction) {
          // In a real app, send to analytics service
          // Example: mixpanel.track(eventName, enhancedProps);
          console.info(
            '%c[EVENT]%c',
            'background: #2196f3; color: white; padding: 2px 4px; border-radius: 4px; font-weight: bold;',
            '',
            eventName,
            enhancedProps
          );
        } else {
          // Development logging
          console.info('[DEV EVENT]', eventName, enhancedProps);
        }
      }).catch(err => {
        // Still log the event even if we can't get the user
        console.info('[EVENT WITHOUT USER]', eventName, enhancedProps);
      });
    } else {
      // Server-side event logging
      console.info('[SERVER EVENT]', eventName, enhancedProps);
    }
  } catch (error) {
    // Failsafe for errors in event tracking
    console.error('Error in event tracking:', error);
  }
}

/**
 * Enhanced global error handling for unhandled promise rejections
 * and unexpected errors
 */
export function setupGlobalErrorHandling(): void {
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
          if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
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
}

/**
 * Initialize the error monitoring system
 */
export function initErrorMonitoring(): void {
  // Set up global error handling
  setupGlobalErrorHandling();
  
  // Log initialization
  console.log(`Error monitoring initialized for ${environment} environment`);
  
  // In production, we would initialize external services here
  if (isProduction) {
    // Initialize third-party services like Sentry
    // Example: Sentry.init({ dsn: config.sentryDsn });
  }
}
