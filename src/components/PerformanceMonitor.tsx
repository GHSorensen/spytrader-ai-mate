
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/errorMonitoring';

interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
}

/**
 * Component that monitors and reports on application performance
 */
const PerformanceMonitor: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    trackEvent('page_view', { path: location.pathname });
    
    // Report initial loading performance
    if ('performance' in window) {
      // Use setTimeout to ensure we capture metrics after the page has loaded
      setTimeout(() => {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        
        const metrics: Partial<PerformanceMetrics> = {
          ttfb: navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : undefined,
          fcp: fcpEntry ? fcpEntry.startTime : undefined,
        };
        
        trackEvent('performance_metrics', metrics);
      }, 1000);
    }
  }, [location.pathname]);

  // Set up observers for Web Vitals if available
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        // Observe LCP
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.startTime;
          
          trackEvent('performance_lcp', { lcp });
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Observe CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // Cast to any because TypeScript doesn't have up-to-date types for LayoutShift
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          
          trackEvent('performance_cls', { cls: clsValue });
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (e) {
        console.error('Error setting up performance observers:', e);
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default PerformanceMonitor;
