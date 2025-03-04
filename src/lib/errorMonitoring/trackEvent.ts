
/**
 * Event tracking implementation
 */

import { environment, isProduction } from '@/config/environment';
import { supabase } from '@/integrations/supabase/client';
import { EventProperties } from './types';

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
