
import React from 'react';
import { CheckCircle, HelpCircle, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IBKRCredentialsFormProps {
  apiKey: string;
  setApiKey: (value: string) => void;
  callbackUrl: string;
  setCallbackUrl: (value: string) => void;
  twsHost: string;
  setTwsHost: (value: string) => void;
  twsPort: string;
  setTwsPort: (value: string) => void;
  apiMethod: 'webapi' | 'tws';
  setApiMethod: (value: 'webapi' | 'tws') => void;
  isConnecting: boolean;
}

const IBKRCredentialsForm: React.FC<IBKRCredentialsFormProps> = ({
  apiKey,
  setApiKey,
  callbackUrl,
  setCallbackUrl,
  twsHost,
  setTwsHost,
  twsPort,
  setTwsPort,
  apiMethod,
  setApiMethod,
  isConnecting
}) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue={apiMethod} onValueChange={(value) => setApiMethod(value as 'webapi' | 'tws')}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="webapi">Client Portal API (Web)</TabsTrigger>
          <TabsTrigger value="tws">TWS API (Desktop)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="webapi" className="space-y-4">
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
                      Check under "Users & Access Rights" section if available.
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
              placeholder="Enter your IBKR Client ID"
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
        </TabsContent>
        
        <TabsContent value="tws" className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="twsHost" className="text-sm font-medium flex items-center">
              <span>TWS Host</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      The hostname or IP address where TWS is running. Use "localhost" or "127.0.0.1" if TWS is on the same computer.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <input
              id="twsHost"
              type="text"
              value={twsHost}
              onChange={(e) => setTwsHost(e.target.value)}
              placeholder="localhost"
              className="w-full p-2 border rounded-md"
              disabled={isConnecting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="twsPort" className="text-sm font-medium flex items-center">
              <span>TWS Port</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      The port TWS is listening on for API connections. The default is 7496 for live trading and 7497 for paper trading.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <input
              id="twsPort"
              type="text"
              value={twsPort}
              onChange={(e) => setTwsPort(e.target.value)}
              placeholder="7496"
              className="w-full p-2 border rounded-md"
              disabled={isConnecting}
            />
          </div>
          
          <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-3 text-sm text-blue-700 dark:text-blue-300">
            <p>
              <strong>Note:</strong> When using the TWS API, you must have Trader Workstation running and logged in 
              on your computer for SPY Trading AI to connect to your IBKR account.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IBKRCredentialsForm;
