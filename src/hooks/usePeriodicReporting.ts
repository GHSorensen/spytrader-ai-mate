
import { useEffect } from 'react';
import { trackEvent } from '@/lib/errorMonitoring';
import { PerformanceMetrics } from '@/lib/types/performance';

export function usePeriodicReporting(
  metricsRef: React.MutableRefObject<Partial<PerformanceMetrics>>,
  path: string
) {
  useEffect(() => {
    const periodicReporter = setInterval(() => {
      if (Object.keys(metricsRef.current.apiLatency || {}).length > 0 ||
          metricsRef.current.cacheHits || 
          metricsRef.current.cacheMisses) {
        trackEvent('performance_periodic', {
          ...metricsRef.current,
          path
        });
      }
    }, 60000);
    
    return () => {
      clearInterval(periodicReporter);
    };
  }, [metricsRef, path]);
}
