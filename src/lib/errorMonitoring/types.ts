
/**
 * Type definitions for error monitoring functionality
 */

// Context information for errors
export interface ErrorContext {
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  timestamp?: string;
  environment?: string;
  userAgent?: string;
  url?: string;
  isPromise?: boolean;
  filename?: string;
  lineno?: number;
  colno?: number;
  memory?: {
    used: number;
    total: number;
    percentage: string;
  };
  [key: string]: any;
}

// Properties for event tracking
export interface EventProperties {
  timestamp?: string;
  path?: string;
  duration?: number;
  [key: string]: any;
}
