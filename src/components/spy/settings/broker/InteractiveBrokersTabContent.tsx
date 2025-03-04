
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrokerSettings } from "@/lib/types/spy/broker";
import { DataProviderStatus } from "@/lib/types/spy/dataProvider";

interface InteractiveBrokersTabContentProps {
  settings: BrokerSettings;
  updateCredential: (key: string, value: string) => void;
  togglePaperTrading: (enabled: boolean) => void;
  testConnection: () => Promise<void>;
  isConnecting: boolean;
  status: DataProviderStatus;
}

export const InteractiveBrokersTabContent: React.FC<InteractiveBrokersTabContentProps> = ({
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
        <CardTitle>Interactive Brokers API</CardTitle>
        <CardDescription>
          Enter your IBKR credentials to connect via the Client Portal API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ibkr-api-key">API Key</Label>
          <Input 
            id="ibkr-api-key" 
            placeholder="Enter your IBKR API key"
            value={settings.credentials.apiKey || ''}
            onChange={(e) => updateCredential('apiKey', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ibkr-account-id">Account ID</Label>
          <Input 
            id="ibkr-account-id" 
            placeholder="Enter your IBKR account ID"
            value={settings.credentials.accountId || ''}
            onChange={(e) => updateCredential('accountId', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ibkr-callback-url">Callback URL</Label>
          <Input 
            id="ibkr-callback-url" 
            placeholder="Enter your callback URL"
            value={settings.credentials.callbackUrl || window.location.origin + '/auth/callback'}
            onChange={(e) => updateCredential('callbackUrl', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            You must whitelist this URL in your IBKR API settings.
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="paper-trading">Paper Trading</Label>
            <div className="text-sm text-muted-foreground">
              Use paper trading account for testing
            </div>
          </div>
          <Switch
            id="paper-trading"
            checked={settings.paperTrading}
            onCheckedChange={togglePaperTrading}
          />
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={isConnecting || !settings.credentials.apiKey || !settings.credentials.accountId}
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
    </Card>
  );
};

export default InteractiveBrokersTabContent;
