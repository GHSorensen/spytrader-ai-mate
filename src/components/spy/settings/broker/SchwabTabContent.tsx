
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BrokerSettings } from "@/lib/types/spy/broker";
import { DataProviderStatus } from "@/lib/types/spy/dataProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SchwabTabContentProps {
  settings: BrokerSettings;
  updateCredential: (key: string, value: string) => void;
  togglePaperTrading: (enabled: boolean) => void;
  testConnection: () => Promise<void>;
  isConnecting: boolean;
  status: DataProviderStatus;
}

export const SchwabTabContent: React.FC<SchwabTabContentProps> = ({
  settings,
  updateCredential,
  togglePaperTrading,
  testConnection,
  isConnecting,
  status,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Schwab API
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Schwab acquired TD Ameritrade. You can use either TD Ameritrade's API or the newer Schwab API.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Enter your Schwab developer credentials from the Developer Portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schwab-app-key">App Key</Label>
          <Input 
            id="schwab-app-key" 
            placeholder="Enter your Schwab App Key"
            value={settings.credentials.appKey || ''}
            onChange={(e) => updateCredential('appKey', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="schwab-api-key">Consumer Key</Label>
          <Input 
            id="schwab-api-key" 
            placeholder="Enter your Schwab Consumer Key"
            value={settings.credentials.apiKey || ''}
            onChange={(e) => updateCredential('apiKey', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="schwab-secret-key">Secret</Label>
          <Input 
            id="schwab-secret-key" 
            type="password"
            placeholder="Enter your Schwab Secret"
            value={settings.credentials.secretKey || ''}
            onChange={(e) => updateCredential('secretKey', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="schwab-callback-url">Callback URL</Label>
          <Input 
            id="schwab-callback-url" 
            placeholder="Enter your OAuth Callback URL"
            value={settings.credentials.callbackUrl || ''}
            onChange={(e) => updateCredential('callbackUrl', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Make sure this matches the URL in your Schwab Developer Portal
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="paper-trading-schwab">Paper Trading</Label>
            <div className="text-sm text-muted-foreground">
              Use paper trading account for testing
            </div>
          </div>
          <Switch
            id="paper-trading-schwab"
            checked={settings.paperTrading}
            onCheckedChange={togglePaperTrading}
          />
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={isConnecting || !settings.credentials.apiKey}
            className="w-full"
          >
            {isConnecting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : status.connected ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        <p>Note: Your App Machine Name is "{settings.credentials.appKey?.substring(0, 10)}..." in the Schwab Developer Portal</p>
      </CardFooter>
    </Card>
  );
};
