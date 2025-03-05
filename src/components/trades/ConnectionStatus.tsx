
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ConnectionStatusProps {
  connectionDiagnostics: string | null;
  lastError: Error | null;
  isRetrying?: boolean;
  retryCount?: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connectionDiagnostics, 
  lastError,
  isRetrying = false,
  retryCount = 0
}) => {
  // Don't show anything if there are no issues
  if (!connectionDiagnostics && !lastError && !isRetrying) {
    return null;
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
        <div className="mt-2 text-xs text-amber-600">
          If connection issues persist, please check your account credentials and network status.
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;
