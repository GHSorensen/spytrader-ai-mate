
/**
 * More specific error types within categories
 */
export enum ErrorType {
  // Connection errors
  NETWORK_OFFLINE = 'network_offline',
  CONNECTION_REFUSED = 'connection_refused',
  CONNECTION_TIMEOUT = 'connection_timeout',
  CONNECTION_CLOSED = 'connection_closed',
  
  // Authentication errors
  AUTH_EXPIRED = 'auth_expired',
  AUTH_INVALID = 'auth_invalid',
  AUTH_MISSING = 'auth_missing',
  AUTH_REQUIRED = 'auth_required',
  
  // Permission errors
  PERMISSION_DENIED = 'permission_denied',
  ACCOUNT_DISABLED = 'account_disabled',
  SUBSCRIPTION_REQUIRED = 'subscription_required',
  READ_ONLY_ACCESS = 'read_only_access',
  
  // Data errors
  INVALID_RESPONSE = 'invalid_response', 
  SCHEMA_VALIDATION = 'schema_validation',
  MISSING_DATA = 'missing_data',
  DATA_CORRUPTED = 'data_corrupted',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  TOO_MANY_REQUESTS = 'too_many_requests',
  QUOTA_EXCEEDED = 'quota_exceeded',
  
  // Timeout errors
  REQUEST_TIMEOUT = 'request_timeout',
  RESPONSE_TIMEOUT = 'response_timeout',
  GATEWAY_TIMEOUT = 'gateway_timeout',
  
  // API errors
  API_ERROR = 'api_error',
  ENDPOINT_NOT_FOUND = 'endpoint_not_found',
  METHOD_NOT_ALLOWED = 'method_not_allowed',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  
  // Client errors
  INVALID_PARAMETERS = 'invalid_parameters',
  CLIENT_ERROR = 'client_error',
  ABORTED = 'aborted',
  
  // Unknown errors
  UNKNOWN = 'unknown'
}
