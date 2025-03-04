
/**
 * Type definitions for error monitoring system
 */

// Interface for error metadata
export interface ErrorContext {
  [key: string]: any;
  userId?: string;
  sessionId?: string;
  component?: string;
  route?: string;
  tags?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Track event interface
export interface EventProperties {
  timestamp: string;
  environment: string;
  sessionId?: string;
  userId?: string;
  [key: string]: any;
}
