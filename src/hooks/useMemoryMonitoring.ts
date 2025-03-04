
import { useEffect, useRef } from 'react';

export function useMemoryMonitoring() {
  const jsHeapSizeRef = useRef<number | null>(null);
  
  useEffect(() => {
    const memoryCheckInterval = setInterval(() => {
      if (performance && 'memory' in performance) {
        jsHeapSizeRef.current = (performance as any).memory.usedJSHeapSize;
      }
    }, 10000);
    
    return () => {
      clearInterval(memoryCheckInterval);
    };
  }, []);

  return { jsHeapSizeRef };
}
