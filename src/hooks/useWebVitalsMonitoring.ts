
import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/errorMonitoring';
import { isProduction } from '@/config/environment';
import { PerformanceMetrics } from '@/lib/types/performance';

export function useWebVitalsMonitoring(path: string) {
  const metricsCollectedRef = useRef<Partial<PerformanceMetrics>>({
    apiLatency: {},
    cacheHits: 0,
    cacheMisses: 0,
  });

  const reportMetrics = (metrics: Partial<PerformanceMetrics>, event = 'performance_metrics') => {
    const shouldReportFull = isProduction || Math.random() < 0.1;
    
    if (shouldReportFull) {
      const navigatorWithConnection = navigator as any;
      
      trackEvent(event, {
        ...metrics,
        path: path,
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

  // Collect basic navigation and paint metrics
  useEffect(() => {
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
  }, [path]);

  // Monitor LCP, CLS, FID, and INP
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
          const firstEntry = entries[0] as any;
          
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
              const interactionEntry = entry as any;
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
    
    return undefined;
  }, [path]);

  return { metricsCollectedRef };
}
