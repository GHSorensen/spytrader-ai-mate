
/**
 * Event tracking functionality for performance and user actions
 */
import { isProduction } from '@/config/environment';
import { EventProperties } from './types';

/**
 * Track events for analytics and monitoring purposes
 */
export function trackEvent(eventName: string, properties?: EventProperties): void {
  try {
    // Add timestamp if not present
    const enhancedProperties = {
      ...properties,
      timestamp: properties?.timestamp || new Date().toISOString(),
    };
    
    // Log event in development mode
    if (!isProduction) {
      console.log(`[EVENT] ${eventName}`, enhancedProperties);
    } else {
      // In production we would send to a monitoring service
      // Example: Analytics.track(eventName, enhancedProperties);
      
      // Still log for debugging if needed
      console.log(`[PROD EVENT] ${eventName}`, enhancedProperties);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}
