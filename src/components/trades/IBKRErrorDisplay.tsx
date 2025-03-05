
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  RefreshCw, 
  NetworkIcon, 
  Lock, 
  Clock, 
  AlertTriangle,
  DatabaseIcon,
  ServerIcon,
  FileWarningIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorCategory, ErrorType, ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

interface IBKRErrorDisplayProps {
  error: Error | ClassifiedError | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  showDetails?: boolean;
}

/**
 * A specialized error display component for IBKR-related errors
 * Shows tailored information based on error classification
 */
const IBKRErrorDisplay: React.FC<IBKRErrorDisplayProps> = ({ 
  error, 
  onRetry,
  isRetrying = false,
  showDetails = false
}) => {
  // Don't show anything if there are no errors
  if (!error) {
    return null;
  }
  
  // Default values
  let title = "An error occurred";
  let icon = <AlertCircle className="h-4 w-4" />;
  let description = error.message;
  let variant: "default" | "destructive" | "warning" = "destructive";
  let actionText = "Try again";
  
  // Classification-based customization
  if ((error as ClassifiedError).category) {
    const classifiedError = error as ClassifiedError;
    
    // Set appropriate icon and variant based on error category
    switch (classifiedError.category) {
      case ErrorCategory.CONNECTION:
        icon = <NetworkIcon className="h-4 w-4" />;
        title = "Connection Error";
        variant = "destructive";
        break;
        
      case ErrorCategory.AUTHENTICATION:
        icon = <Lock className="h-4 w-4" />;
        title = "Authentication Error";
        variant = "destructive";
        actionText = "Reconnect";
        break;
        
      case ErrorCategory.PERMISSION:
        icon = <FileWarningIcon className="h-4 w-4" />;
        title = "Permission Error";
        variant = "destructive";
        break;
        
      case ErrorCategory.TIMEOUT:
        icon = <Clock className="h-4 w-4" />;
        title = "Timeout Error";
        variant = "warning";
        break;
        
      case ErrorCategory.RATE_LIMIT:
        icon = <AlertTriangle className="h-4 w-4" />;
        title = "Rate Limit Exceeded";
        variant = "warning";
        actionText = "Try again later";
        break;
        
      case ErrorCategory.DATA:
        icon = <DatabaseIcon className="h-4 w-4" />;
        title = "Data Error";
        variant = "warning";
        break;
        
      case ErrorCategory.API:
        icon = <ServerIcon className="h-4 w-4" />;
        title = "API Error";
        variant = "warning";
        break;
    }
    
    // Additional customization based on specific error types
    if (classifiedError.errorType === ErrorType.CONNECTION_REFUSED) {
      description = "Connection to Interactive Brokers was refused. Is TWS running and API connections enabled?";
    } else if (classifiedError.errorType === ErrorType.AUTH_EXPIRED) {
      description = "Your Interactive Brokers session has expired. Please reconnect.";
    } else if (classifiedError.errorType === ErrorType.RATE_LIMIT_EXCEEDED) {
      description = "You've reached the rate limit for Interactive Brokers API. Please wait before trying again.";
    }
  }
  
  return (
    <Alert variant={variant} className={
      variant === "destructive" 
        ? "bg-red-50 border-red-300 text-red-900 mb-4" 
        : variant === "warning"
          ? "bg-amber-50 border-amber-300 text-amber-900 mb-4"
          : "mb-4"
    }>
      <div className="text-red-600">{icon}</div>
      <AlertTitle className={
        variant === "destructive" 
          ? "text-red-800" 
          : variant === "warning" 
            ? "text-amber-800" 
            : ""
      }>
        {title}
      </AlertTitle>
      <AlertDescription className={
        variant === "destructive"
          ? "mt-2 text-sm text-red-700"
          : variant === "warning"
            ? "mt-2 text-sm text-amber-700"
            : "mt-2 text-sm"
      }>
        <div className="mb-2">
          {description}
        </div>
        
        {showDetails && (error as ClassifiedError).errorType && (
          <div className="text-xs opacity-80 mb-2">
            Error type: {(error as ClassifiedError).errorType}
          </div>
        )}
        
        {onRetry && (
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              disabled={isRetrying}
              className={
                variant === "destructive"
                  ? "bg-white border-red-400 text-red-700 hover:bg-red-50"
                  : variant === "warning"
                    ? "bg-white border-amber-400 text-amber-700 hover:bg-amber-50"
                    : ""
              }
            >
              {isRetrying && <RefreshCw className="h-3 w-3 mr-2 animate-spin" />}
              {isRetrying ? "Retrying..." : actionText}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default IBKRErrorDisplay;
