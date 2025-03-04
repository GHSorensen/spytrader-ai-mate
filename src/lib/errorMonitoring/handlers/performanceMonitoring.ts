
/**
 * Performance monitoring setup
 */

import { isProduction } from '@/config/environment';
import { logError } from '../core/logger';

/**
 * Set up performance monitoring to track long-running tasks and memory issues
 */
export function setupPerformanceMonitoring(): void {
  try {
    if (typeof window !== 'undefined') {
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
    console.error('Error setting up performance monitoring:', err);
  }
}
