
import { useEffect, useRef } from 'react';
import { config } from '@/config/environment';

interface ApiMetrics {
  apiLatency: Record<string, number>;
  cacheHits: number;
  cacheMisses: number;
}

export function useApiPerformanceMonitoring(): {
  metricsRef: React.MutableRefObject<ApiMetrics>;
} {
  const metricsRef = useRef<ApiMetrics>({
    apiLatency: {},
    cacheHits: 0,
    cacheMisses: 0,
  });

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
        // URL parsing failed, use the original string
      }
      
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        const apiLatency = metricsRef.current.apiLatency || {};
        apiLatency[endpoint] = latency;
        metricsRef.current.apiLatency = apiLatency;
        
        const cacheStatus = response.headers.get('x-cache');
        if (cacheStatus) {
          if (cacheStatus.includes('HIT')) {
            metricsRef.current.cacheHits = (metricsRef.current.cacheHits || 0) + 1;
          } else if (cacheStatus.includes('MISS')) {
            metricsRef.current.cacheMisses = (metricsRef.current.cacheMisses || 0) + 1;
          }
        }
        
        if (latency > 1000) {
          console.warn(`Slow API call detected: ${endpoint} took ${latency.toFixed(2)}ms`);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        const apiLatency = metricsRef.current.apiLatency || {};
        apiLatency[`${endpoint}|error`] = latency;
        metricsRef.current.apiLatency = apiLatency;
        
        throw error;
      }
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return { metricsRef };
}
