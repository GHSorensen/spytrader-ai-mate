
import React from 'react';
import { CheckCircle, HelpCircle, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IBKRCredentialsFormProps {
  apiKey: string;
  setApiKey: (value: string) => void;
  callbackUrl: string;
  setCallbackUrl: (value: string) => void;
  isConnecting: boolean;
}

const IBKRCredentialsForm: React.FC<IBKRCredentialsFormProps> = ({
  apiKey,
  setApiKey,
  callbackUrl,
  setCallbackUrl,
  isConnecting
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-sm font-medium flex items-center">
          <span>IBKR Client ID (API Key)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  This is NOT your IBKR username or password. It's the Client ID you generate in IBKR API Settings. 
                  Look for "Register a new API application" in your IBKR account settings.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <input
          id="apiKey"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your IBKR Client ID (not your username/password)"
          className="w-full p-2 border rounded-md"
          disabled={isConnecting}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="callbackUrl" className="text-sm font-medium flex items-center">
          <span>Callback URL (must match URL configured in IBKR)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-80 text-xs">This URL must be registered in your IBKR API Settings as an authorized redirect URL. After authorization, IBKR will redirect back to this URL.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <div className="flex items-center">
          <input
            id="callbackUrl"
            type="text"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={isConnecting}
          />
          {callbackUrl === `${window.location.origin}/auth/ibkr/callback` && (
            <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default IBKRCredentialsForm;
