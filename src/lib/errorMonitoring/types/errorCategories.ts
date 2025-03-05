
/**
 * Common error categories across all data providers
 */
export enum ErrorCategory {
  // Connection related errors
  CONNECTION = 'connection',
  // Authentication related errors
  AUTHENTICATION = 'authentication',
  // Permission related errors
  PERMISSION = 'permission',
  // Data formatting or validation errors
  DATA = 'data',
  // Rate limiting errors
  RATE_LIMIT = 'rate_limit',
  // Timeout errors
  TIMEOUT = 'timeout',
  // General API errors
  API = 'api',
  // Client-side errors
  CLIENT = 'client',
  // Unexpected errors
  UNKNOWN = 'unknown'
}
