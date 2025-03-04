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

interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
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
  
  const reportMetrics = (metrics: Partial<PerformanceMetrics>, event = 'performance_metrics') => {
    const shouldReportFull = isProduction || Math.random() < 0.1;
    
    if (shouldReportFull) {
      const navigatorWithConnection = navigator as NavigatorWithConnection;
      
      trackEvent(event, {
        ...metrics,
        path: location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        connection: navigatorWithConnection.connection 
          ? {
              effectiveType: navigatorWithConnection.connection.effectiveType,
              downlink: navigatorWithConnection.connection.downlink,
              rtt: navigatorWithConnection.connection.rtt,
            }
          : undefined,
      });
    }
  };
  
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
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
      
      let endpoint = url;
      try {
        const urlObj = new URL(url);
        endpoint = urlObj.pathname;
      } catch (e) {
      }
      
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        const apiLatency = metricsCollectedRef.current.apiLatency || {};
        apiLatency[endpoint] = latency;
        metricsCollectedRef.current.apiLatency = apiLatency;
        
        const cacheStatus = response.headers.get('x-cache');
        if (cacheStatus) {
          if (cacheStatus.includes('HIT')) {
            metricsCollectedRef.current.cacheHits = (metricsCollectedRef.current.cacheHits || 0) + 1;
          } else if (cacheStatus.includes('MISS')) {
            metricsCollectedRef.current.cacheMisses = (metricsCollectedRef.current.cacheMisses || 0) + 1;
          }
        }
        
        if (latency > 1000) {
          console.warn(`Slow API call detected: ${endpoint} took ${latency.toFixed(2)}ms`);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        const apiLatency = metricsCollectedRef.current.apiLatency || {};
        apiLatency[`${endpoint}|error`] = latency;
        metricsCollectedRef.current.apiLatency = apiLatency;
        
        throw error;
      }
    };
    
    const memoryCheckInterval = setInterval(() => {
      if (performance && 'memory' in performance) {
        metricsCollectedRef.current.jsHeapSize = (performance as any).memory.usedJSHeapSize;
      }
    }, 10000);
    
    return () => {
      window.fetch = originalFetch;
      clearInterval(memoryCheckInterval);
    };
  }, []);
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (prevPathRef.current !== currentPath) {
      const timestamp = new Date().toISOString();
      
      let userId: string | undefined;
      
      supabase.auth.getSession().then(({ data }) => {
        userId = data?.session?.user?.id;
        
        trackEvent('page_view', { 
          from: prevPathRef.current || '(initial)',
          to: currentPath,
          timestamp,
          userId
        });
        
        if (prevPathRef.current && navigationStartTimeRef.current > 0) {
          const navigationDuration = performance.now() - navigationStartTimeRef.current;
          
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
        trackEvent('page_view', { 
          from: prevPathRef.current || '(initial)',
          to: currentPath,
          timestamp
        });
      });
      
      navigationStartTimeRef.current = performance.now();
      prevPathRef.current = currentPath;
      
      metricsCollectedRef.current = {
        apiLatency: {},
        cacheHits: 0,
        cacheMisses: 0,
      };
      
      if ('performance' in window) {
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
  
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.startTime;
          
          metricsCollectedRef.current.lcp = lcp;
          
          if (lcp > 2500) {
            reportMetrics({ lcp }, 'performance_lcp_slow');
          } else {
            reportMetrics({ lcp }, 'performance_lcp');
          }
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          
          metricsCollectedRef.current.cls = clsValue;
          
          if (clsValue > 0.1) {
            reportMetrics({ cls: clsValue }, 'performance_cls');
          }
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0] as unknown as {
            processingStart: number;
            startTime: number;
          };
          
          if (firstEntry) {
            const fid = firstEntry.processingStart - firstEntry.startTime;
            
            metricsCollectedRef.current.fid = fid;
            
            if (fid > 100) {
              reportMetrics({ fid }, 'performance_fid_slow');
            } else {
              reportMetrics({ fid }, 'performance_fid');
            }
          }
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        try {
          const inpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            let maxDelay = 0;
            
            for (const entry of entries) {
              const interactionEntry = entry as unknown as {
                processingStart: number;
                startTime: number;
              };
              const delay = interactionEntry.processingStart - interactionEntry.startTime;
              maxDelay = Math.max(maxDelay, delay);
            }
            
            if (maxDelay > 0) {
              metricsCollectedRef.current.inp = maxDelay;
              
              if (maxDelay > 200) {
                reportMetrics({ inp: maxDelay }, 'performance_inp_slow');
              }
            }
          });
          
          inpObserver.observe({ 
            type: 'event', 
            buffered: true,
            durationThreshold: 40
          } as any);
        } catch (e) {
          console.info('INP monitoring not supported in this browser');
        }
        
        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
        };
      } catch (e) {
        console.error('Error setting up performance observers:', e);
      }
    }
    
    const periodicReporter = setInterval(() => {
      if (Object.keys(metricsCollectedRef.current.apiLatency || {}).length > 0 ||
          metricsCollectedRef.current.cacheHits || 
          metricsCollectedRef.current.cacheMisses) {
        reportMetrics(metricsCollectedRef.current, 'performance_periodic');
      }
    }, 60000);
    
    return () => {
      clearInterval(periodicReporter);
    };
  }, []);
  
  return null;
};

export default PerformanceMonitor;
