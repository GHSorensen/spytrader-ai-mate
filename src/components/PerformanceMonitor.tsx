
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/errorMonitoring';
import { config, isProduction } from '@/config/environment';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  inp: number | null;
  ttl: number | null; // Time to Load
  resourceCount: number;
  jsHeapSize: number | null;
  cacheHits: number;
  cacheMisses: number;
  apiLatency: Record<string, number>;
}

/**
 * Enhanced component that monitors and reports on application performance in production
 */
const PerformanceMonitor: React.FC = () => {
  const location = useLocation();
  const prevPathRef = useRef<string>('');
  const navigationStartTimeRef = useRef<number>(0);
  const metricsCollectedRef = useRef<Partial<PerformanceMetrics>>({
    apiLatency: {},
    cacheHits: 0,
    cacheMisses: 0,
  });
  
  // Shared function to report metrics
  const reportMetrics = (metrics: Partial<PerformanceMetrics>, event = 'performance_metrics') => {
    // Only send all metrics in production or when sampling in development
    const shouldReportFull = isProduction || Math.random() < 0.1;
    
    if (shouldReportFull) {
      trackEvent(event, {
        ...metrics,
        path: location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        connection: navigator.connection 
          ? {
              effectiveType: (navigator.connection as any).effectiveType,
              downlink: (navigator.connection as any).downlink,
              rtt: (navigator.connection as any).rtt,
            }
          : undefined,
      });
    }
  };
  
  // Track API latency
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      // Only track API calls
      const url = typeof input === 'string' 
        ? input 
        : input instanceof URL 
          ? input.toString() 
          : input instanceof Request 
            ? input.url 
            : '';
            
      const isApiCall = url.includes(config.apiUrl) || 
                        url.includes(config.supabaseUrl);
                        
      if (!isApiCall) {
        return originalFetch(input, init);
      }
      
      // Calculate a more user-friendly endpoint name
      let endpoint = url;
      try {
        const urlObj = new URL(url);
        endpoint = urlObj.pathname;
      } catch (e) {
        // If URL parsing fails, use the original
      }
      
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        // Update metrics
        const apiLatency = metricsCollectedRef.current.apiLatency || {};
        apiLatency[endpoint] = latency;
        metricsCollectedRef.current.apiLatency = apiLatency;
        
        // Track cache hit status
        const cacheStatus = response.headers.get('x-cache');
        if (cacheStatus) {
          if (cacheStatus.includes('HIT')) {
            metricsCollectedRef.current.cacheHits = (metricsCollectedRef.current.cacheHits || 0) + 1;
          } else if (cacheStatus.includes('MISS')) {
            metricsCollectedRef.current.cacheMisses = (metricsCollectedRef.current.cacheMisses || 0) + 1;
          }
        }
        
        // Log slow API calls
        if (latency > 1000) {
          console.warn(`Slow API call detected: ${endpoint} took ${latency.toFixed(2)}ms`);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        // Still record the latency even for failed requests
        const apiLatency = metricsCollectedRef.current.apiLatency || {};
        apiLatency[`${endpoint}|error`] = latency;
        metricsCollectedRef.current.apiLatency = apiLatency;
        
        throw error;
      }
    };
    
    // Monitor memory usage
    const memoryCheckInterval = setInterval(() => {
      if (performance && 'memory' in performance) {
        metricsCollectedRef.current.jsHeapSize = (performance as any).memory.usedJSHeapSize;
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      window.fetch = originalFetch;
      clearInterval(memoryCheckInterval);
    };
  }, []);
  
  // Track route changes and user journey
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only run on path changes
    if (prevPathRef.current !== currentPath) {
      const timestamp = new Date().toISOString();
      
      // Get session identifier or user id
      let userId: string | undefined;
      
      // Get current user if available
      supabase.auth.getSession().then(({ data }) => {
        userId = data?.session?.user?.id;
        
        // Track route change
        trackEvent('page_view', { 
          from: prevPathRef.current || '(initial)',
          to: currentPath,
          timestamp,
          userId
        });
        
        // Calculate navigation duration if this isn't the first page
        if (prevPathRef.current && navigationStartTimeRef.current > 0) {
          const navigationDuration = performance.now() - navigationStartTimeRef.current;
          
          // Only log navigation durations over 100ms
          if (navigationDuration > 100) {
            trackEvent('navigation_duration', {
              from: prevPathRef.current,
              to: currentPath,
              duration: navigationDuration,
              userId
            });
          }
        }
      }).catch(() => {
        // Still track even if we can't get the user
        trackEvent('page_view', { 
          from: prevPathRef.current || '(initial)',
          to: currentPath,
          timestamp
        });
      });
      
      // Mark navigation start time
      navigationStartTimeRef.current = performance.now();
      prevPathRef.current = currentPath;
      
      // Reset metrics collection for the new page
      metricsCollectedRef.current = {
        apiLatency: {},
        cacheHits: 0,
        cacheMisses: 0,
      };
      
      // Report initial loading performance
      if ('performance' in window) {
        // Use setTimeout to ensure we capture metrics after the page has loaded
        setTimeout(() => {
          try {
            const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const paintEntries = performance.getEntriesByType('paint');
            const resourceEntries = performance.getEntriesByType('resource');
            
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            
            const metrics: Partial<PerformanceMetrics> = {
              ttfb: navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : undefined,
              fcp: fcpEntry ? fcpEntry.startTime : undefined,
              ttl: navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.fetchStart : undefined,
              resourceCount: resourceEntries.length
            };
            
            reportMetrics(metrics);
          } catch (e) {
            console.warn('Error collecting performance metrics:', e);
          }
        }, 1000);
      }
    }
  }, [location.pathname]);

  // Set up observers for Web Vitals
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        // Observe LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.startTime;
          
          metricsCollectedRef.current.lcp = lcp;
          
          // Report LCP separately
          if (lcp > 2500) {
            reportMetrics({ lcp }, 'performance_lcp_slow');
          } else {
            reportMetrics({ lcp }, 'performance_lcp');
          }
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Observe CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // Cast to any because TypeScript doesn't have up-to-date types
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          
          metricsCollectedRef.current.cls = clsValue;
          
          // Only report CLS when it's significant
          if (clsValue > 0.1) {
            reportMetrics({ cls: clsValue }, 'performance_cls');
          }
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        // Observe FID (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0];
          
          if (firstEntry) {
            const fid = firstEntry.processingStart - firstEntry.startTime;
            
            metricsCollectedRef.current.fid = fid;
            
            // Report FID separately if it's poor
            if (fid > 100) {
              reportMetrics({ fid }, 'performance_fid_slow');
            } else {
              reportMetrics({ fid }, 'performance_fid');
            }
          }
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        // Try to observe INP (Interaction to Next Paint) if supported
        try {
          const inpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            let maxDelay = 0;
            
            for (const entry of entries) {
              // Find the maximum delay
              const delay = (entry as any).processingStart - (entry as any).startTime;
              maxDelay = Math.max(maxDelay, delay);
            }
            
            if (maxDelay > 0) {
              metricsCollectedRef.current.inp = maxDelay;
              
              // Report INP separately if it's poor
              if (maxDelay > 200) {
                reportMetrics({ inp: maxDelay }, 'performance_inp_slow');
              }
            }
          });
          
          inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 });
        } catch (e) {
          // INP might not be supported in all browsers
          console.info('INP monitoring not supported in this browser');
        }
        
        // Clean up observers on unmount
        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
        };
      } catch (e) {
        console.error('Error setting up performance observers:', e);
      }
    }
    
    // Create periodic reporter for collected metrics
    const periodicReporter = setInterval(() => {
      if (Object.keys(metricsCollectedRef.current.apiLatency || {}).length > 0 ||
          metricsCollectedRef.current.cacheHits || 
          metricsCollectedRef.current.cacheMisses) {
        reportMetrics(metricsCollectedRef.current, 'performance_periodic');
      }
    }, 60000); // Report every minute
    
    return () => {
      clearInterval(periodicReporter);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default PerformanceMonitor;
