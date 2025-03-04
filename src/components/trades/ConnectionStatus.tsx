
import React from 'react';
import { AlertTriangle } from "lucide-react";

interface ConnectionStatusProps {
  connectionDiagnostics: string | null;
  lastError: string | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionDiagnostics,
  lastError
}) => {
  if (!connectionDiagnostics && !lastError) {
    return null;
  }

  return (
    <>
      {connectionDiagnostics && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 text-sm flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Connection diagnostics:</p>
            <p className="mt-1">{connectionDiagnostics}</p>
          </div>
        </div>
      )}

      {lastError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Last error:</p>
            <p className="mt-1">{lastError}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionStatus;
