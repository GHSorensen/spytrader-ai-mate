
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrokerSettings } from "@/lib/types/spy/broker";
import { DataProviderStatus } from "@/lib/types/spy/dataProvider";

interface TDAmeritradeTabContentProps {
  settings: BrokerSettings;
  updateCredential: (key: string, value: string) => void;
  togglePaperTrading: (enabled: boolean) => void;
  testConnection: () => Promise<void>;
  isConnecting: boolean;
  status: DataProviderStatus;
}

export const TDAmeritradeTabContent: React.FC<TDAmeritradeTabContentProps> = ({
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
        <CardTitle>TD Ameritrade API</CardTitle>
        <CardDescription>
          Enter your TD Ameritrade developer credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="td-api-key">Consumer Key</Label>
          <Input 
            id="td-api-key" 
            placeholder="Enter your TD Ameritrade consumer key"
            value={settings.credentials.apiKey || ''}
            onChange={(e) => updateCredential('apiKey', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="td-secret-key">Redirect URI</Label>
          <Input 
            id="td-secret-key" 
            placeholder="Enter your redirect URI"
            value={settings.credentials.secretKey || ''}
            onChange={(e) => updateCredential('secretKey', e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="paper-trading-td">Paper Trading</Label>
            <div className="text-sm text-muted-foreground">
              Use paper trading account for testing
            </div>
          </div>
          <Switch
            id="paper-trading-td"
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
    </Card>
  );
};
