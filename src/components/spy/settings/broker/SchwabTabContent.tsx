
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SchwabTabContentProps {
  isConnecting: boolean;
  brokerStatus: string;
  onConnect: () => Promise<boolean>;
  onDisconnect: () => Promise<boolean>;
}

const SchwabTabContent: React.FC<SchwabTabContentProps> = ({
  isConnecting,
  brokerStatus,
  onConnect,
  onDisconnect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schwab Integration</CardTitle>
        <CardDescription>
          Connect to your Schwab account for live trading and market data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input 
              id="clientId" 
              placeholder="Enter your Schwab client ID" 
              disabled={brokerStatus === 'connected' || isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              Get your client ID from the Schwab Developer Portal
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schwabCallbackUrl">Callback URL</Label>
            <Input 
              id="schwabCallbackUrl" 
              defaultValue={`${window.location.origin}/auth/schwab/callback`}
              disabled={brokerStatus === 'connected' || isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              This must match the redirect URI in your Schwab app settings
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
            {isConnecting ? 'Connecting...' : 'Connect to Schwab'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SchwabTabContent;
