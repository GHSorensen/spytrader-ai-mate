
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from 'lucide-react';

interface IBKRActionButtonsProps {
  isConnecting: boolean;
  isConfigured: boolean;
  apiMethod: 'webapi' | 'tws';
  apiKey: string;
  twsHost: string;
  twsPort: string;
  onBackToDashboard: () => void;
  onTestConnection: () => void;
  onStartAuth: () => void;
  onTwsConnect: () => void;
  onManualReconnect?: () => void;
  reconnectAttempts?: number;
}

const IBKRActionButtons: React.FC<IBKRActionButtonsProps> = ({
  isConnecting,
  isConfigured,
  apiMethod,
  apiKey,
  twsHost,
  twsPort,
  onBackToDashboard,
  onTestConnection,
  onStartAuth,
  onTwsConnect,
  onManualReconnect,
  reconnectAttempts = 0
}) => {
  // Determine if the current method has enough info to connect
  const canConnect = apiMethod === 'webapi' 
    ? !!apiKey 
    : !!twsHost && !!twsPort;
    
  return (
    <div className="flex justify-between flex-wrap gap-4">
      <Button
        variant="outline"
        onClick={onBackToDashboard}
        disabled={isConnecting}
      >
        Back to Dashboard
      </Button>
      
      <div className="space-x-4">
        {isConfigured && (
          <>
            <Button 
              variant="secondary" 
              onClick={onTestConnection}
              disabled={isConnecting}
            >
              Test Connection
            </Button>
            
            {onManualReconnect && (
              <Button
                variant="outline"
                onClick={onManualReconnect}
                disabled={isConnecting}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isConnecting ? 'Reconnecting...' : 'Reconnect'}
                {reconnectAttempts > 0 && !isConnecting && (
                  <span className="text-xs bg-red-100 text-red-800 rounded-full px-1">
                    {reconnectAttempts}
                  </span>
                )}
              </Button>
            )}
          </>
        )}
        
        <Button 
          onClick={apiMethod === 'webapi' ? onStartAuth : onTwsConnect} 
          disabled={isConnecting || !canConnect}
          className="flex items-center"
        >
          {isConnecting 
            ? "Connecting..." 
            : (isConfigured 
                ? "Reconnect" 
                : (apiMethod === 'webapi' 
                    ? "Connect to IBKR Web API" 
                    : "Connect to TWS")
              )
          }
          {!isConnecting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default IBKRActionButtons;
