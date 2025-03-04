
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/errorMonitoring';
import { supabase } from '@/integrations/supabase/client';

export function usePageNavigation() {
  const location = useLocation();
  const prevPathRef = useRef<string>('');
  const navigationStartTimeRef = useRef<number>(0);

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
    }
  }, [location.pathname]);

  return {
    currentPath: location.pathname,
    previousPath: prevPathRef.current
  };
}
