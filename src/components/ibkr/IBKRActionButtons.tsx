
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface IBKRActionButtonsProps {
  isConnecting: boolean;
  isConfigured: boolean;
  apiKey: string;
  onBackToDashboard: () => void;
  onTestConnection: () => void;
  onStartAuth: () => void;
}

const IBKRActionButtons: React.FC<IBKRActionButtonsProps> = ({
  isConnecting,
  isConfigured,
  apiKey,
  onBackToDashboard,
  onTestConnection,
  onStartAuth
}) => {
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
          <Button 
            variant="secondary" 
            onClick={onTestConnection}
            disabled={isConnecting}
          >
            Test Connection
          </Button>
        )}
        
        <Button 
          onClick={onStartAuth} 
          disabled={isConnecting || !apiKey}
          className="flex items-center"
        >
          {isConnecting ? "Connecting..." : (isConfigured ? "Reconnect" : "Connect to IBKR")}
          {!isConnecting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default IBKRActionButtons;
