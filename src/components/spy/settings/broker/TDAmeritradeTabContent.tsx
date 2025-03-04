
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TDAmeritradeTabContentProps {
  isConnecting: boolean;
  brokerStatus: string;
  onConnect: () => Promise<boolean>;
  onDisconnect: () => Promise<boolean>;
}

const TDAmeritradeTabContent: React.FC<TDAmeritradeTabContentProps> = ({
  isConnecting,
  brokerStatus,
  onConnect,
  onDisconnect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>TD Ameritrade Integration</CardTitle>
        <CardDescription>
          Connect to your TD Ameritrade account for live trading and market data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Consumer Key (API Key)</Label>
            <Input 
              id="apiKey" 
              placeholder="Enter your TD Ameritrade API key" 
              disabled={brokerStatus === 'connected' || isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from the TD Ameritrade Developer Portal
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="callbackUrl">Callback URL</Label>
            <Input 
              id="callbackUrl" 
              defaultValue={`${window.location.origin}/auth/callback`}
              disabled={brokerStatus === 'connected' || isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              This must match the redirect URI in your TD Ameritrade app settings
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {brokerStatus === 'connected' ? (
          <Button 
            variant="destructive" 
            onClick={onDisconnect}
            disabled={isConnecting}
          >
            Disconnect
          </Button>
        ) : (
          <Button 
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect to TD Ameritrade'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TDAmeritradeTabContent;
