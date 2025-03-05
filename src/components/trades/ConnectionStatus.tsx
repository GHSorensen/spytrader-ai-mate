
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionStatusProps {
  connectionDiagnostics: string | null;
  lastError: Error | null;
  isRetrying?: boolean;
  retryCount?: number;
  reconnectAttempts?: number;
  onManualReconnect?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connectionDiagnostics, 
  lastError,
  isRetrying = false,
  retryCount = 0,
  reconnectAttempts = 0,
  onManualReconnect
}) => {
  // Don't show anything if there are no issues
  if (!connectionDiagnostics && !lastError && !isRetrying && reconnectAttempts === 0) {
    return null;
  }
  
  // Show success message if connection was restored
  if (connectionDiagnostics === "Connection restored" && !isRetrying && !lastError) {
    return (
      <Alert className="bg-green-50 border-green-300 text-green-900 mb-4 transition-all duration-500">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 flex items-center gap-2">
          Connection Restored
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm text-green-700">
          Successfully reconnected to the data provider. Your data has been refreshed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="bg-amber-50 border-amber-300 text-amber-900">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 flex items-center gap-2">
        Connection Status
        {isRetrying && <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />}
      </AlertTitle>
      <AlertDescription className="mt-2 text-sm text-amber-700">
        {connectionDiagnostics && (
          <div className="mb-2">
            <strong>Connection diagnostic:</strong> {connectionDiagnostics}
          </div>
        )}
        {lastError && (
          <div className="mb-2">
            <strong>Last error:</strong> {lastError.message}
          </div>
        )}
        {isRetrying && (
          <div className="text-amber-600 font-medium">
            Attempting to reconnect... (Attempt {retryCount})
          </div>
        )}
        {reconnectAttempts > 0 && !isRetrying && (
          <div className="mb-2 text-amber-600 font-medium">
            Auto-reconnect attempts: {reconnectAttempts}
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-amber-600">
            If connection issues persist, please check your account credentials and network status.
          </div>
          {onManualReconnect && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onManualReconnect}
              className="bg-white border-amber-400 text-amber-700 hover:bg-amber-50"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Manual Reconnect
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;
