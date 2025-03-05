
import { ErrorCategory } from './errorCategories';
import { ErrorType } from './errorTypes';

/**
 * HTTP status code mapping to error categories
 */
export const HTTP_STATUS_TO_CATEGORY: Record<number, ErrorCategory> = {
  400: ErrorCategory.CLIENT,
  401: ErrorCategory.AUTHENTICATION,
  403: ErrorCategory.PERMISSION,
  404: ErrorCategory.API,
  408: ErrorCategory.TIMEOUT,
  409: ErrorCategory.DATA,
  413: ErrorCategory.CLIENT,
  422: ErrorCategory.DATA,
  429: ErrorCategory.RATE_LIMIT,
  500: ErrorCategory.API,
  502: ErrorCategory.API,
  503: ErrorCategory.API,
  504: ErrorCategory.TIMEOUT
};

/**
 * HTTP status code mapping to more specific error types
 */
export const HTTP_STATUS_TO_ERROR_TYPE: Record<number, ErrorType> = {
  400: ErrorType.INVALID_PARAMETERS,
  401: ErrorType.AUTH_INVALID,
  403: ErrorType.PERMISSION_DENIED,
  404: ErrorType.ENDPOINT_NOT_FOUND,
  408: ErrorType.REQUEST_TIMEOUT,
  409: ErrorType.DATA_CORRUPTED,
  413: ErrorType.QUOTA_EXCEEDED,
  422: ErrorType.SCHEMA_VALIDATION,
  429: ErrorType.RATE_LIMIT_EXCEEDED,
  500: ErrorType.API_ERROR,
  502: ErrorType.API_ERROR,
  503: ErrorType.SERVICE_UNAVAILABLE,
  504: ErrorType.GATEWAY_TIMEOUT
};

/**
 * Error message mapping for user-friendly messages
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  // Connection errors
  [ErrorType.NETWORK_OFFLINE]: "Your internet connection appears to be offline.",
  [ErrorType.CONNECTION_REFUSED]: "The connection was refused. The server may be down or not accepting connections.",
  [ErrorType.CONNECTION_TIMEOUT]: "The connection timed out. Please try again later.",
  [ErrorType.CONNECTION_CLOSED]: "The connection was closed unexpectedly.",
  
  // Authentication errors
  [ErrorType.AUTH_EXPIRED]: "Your authentication has expired. Please log in again.",
  [ErrorType.AUTH_INVALID]: "Invalid authentication credentials. Please check your API key or login information.",
  [ErrorType.AUTH_MISSING]: "Authentication credentials are missing. Please provide your API key or login information.",
  [ErrorType.AUTH_REQUIRED]: "Authentication is required to access this resource.",
  
  // Permission errors
  [ErrorType.PERMISSION_DENIED]: "You don't have permission to perform this action.",
  [ErrorType.ACCOUNT_DISABLED]: "Your account has been disabled. Please contact support.",
  [ErrorType.SUBSCRIPTION_REQUIRED]: "A subscription is required for this feature.",
  [ErrorType.READ_ONLY_ACCESS]: "You have read-only access to this resource.",
  
  // Data errors
  [ErrorType.INVALID_RESPONSE]: "Invalid response received from the server.",
  [ErrorType.SCHEMA_VALIDATION]: "The data format is invalid or incomplete.",
  [ErrorType.MISSING_DATA]: "Required data is missing from the response.",
  [ErrorType.DATA_CORRUPTED]: "The data appears to be corrupted or in an unexpected format.",
  
  // Rate limiting errors
  [ErrorType.RATE_LIMIT_EXCEEDED]: "Rate limit exceeded. Please try again later.",
  [ErrorType.TOO_MANY_REQUESTS]: "Too many requests. Please slow down and try again later.",
  [ErrorType.QUOTA_EXCEEDED]: "Your API quota has been exceeded for this time period.",
  
  // Timeout errors
  [ErrorType.REQUEST_TIMEOUT]: "The request timed out. Please try again later.",
  [ErrorType.RESPONSE_TIMEOUT]: "The server took too long to respond. Please try again later.",
  [ErrorType.GATEWAY_TIMEOUT]: "The gateway timed out. Please try again later.",
  
  // API errors
  [ErrorType.API_ERROR]: "An API error occurred. Please try again later.",
  [ErrorType.ENDPOINT_NOT_FOUND]: "The requested API endpoint was not found.",
  [ErrorType.METHOD_NOT_ALLOWED]: "The requested method is not allowed for this endpoint.",
  [ErrorType.SERVICE_UNAVAILABLE]: "The service is temporarily unavailable. Please try again later.",
  
  // Client errors
  [ErrorType.INVALID_PARAMETERS]: "Invalid parameters were provided in the request.",
  [ErrorType.CLIENT_ERROR]: "An error occurred in the client application.",
  [ErrorType.ABORTED]: "The operation was aborted.",
  
  // Unknown errors
  [ErrorType.UNKNOWN]: "An unknown error occurred."
};

/**
 * Maps error types to whether they're retryable by default
 */
export const RETRYABLE_ERROR_TYPES: Set<ErrorType> = new Set([
  ErrorType.NETWORK_OFFLINE,
  ErrorType.CONNECTION_TIMEOUT,
  ErrorType.CONNECTION_CLOSED,
  ErrorType.RATE_LIMIT_EXCEEDED,
  ErrorType.TOO_MANY_REQUESTS,
  ErrorType.REQUEST_TIMEOUT,
  ErrorType.RESPONSE_TIMEOUT,
  ErrorType.GATEWAY_TIMEOUT,
  ErrorType.SERVICE_UNAVAILABLE
]);
