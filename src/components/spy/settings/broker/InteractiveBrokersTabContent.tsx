
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConnectionStatus from '@/components/ibkr/ConnectionStatus';

interface InteractiveBrokersTabContentProps {
  isConnecting: boolean;
  brokerStatus: string;
  onConnect: () => Promise<boolean>;
  onDisconnect: () => Promise<boolean>;
  dataProvider: any;
}

const InteractiveBrokersTabContent: React.FC<InteractiveBrokersTabContentProps> = ({
  isConnecting,
  brokerStatus,
  onConnect,
  onDisconnect,
  dataProvider
}) => {
  const navigate = useNavigate();
  
  const handleGoToIntegration = () => {
    navigate('/ibkr-integration');
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle>Interactive Brokers Integration</CardTitle>
            <CardDescription>
              Connect to your Interactive Brokers account for live trading and market data.
            </CardDescription>
          </div>
          <ConnectionStatus 
            status={
              brokerStatus === 'connected' ? 'connected' : 
              brokerStatus === 'connecting' ? 'connecting' : 
              brokerStatus === 'error' ? 'error' : 
              'disconnected'
            } 
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            Interactive Brokers offers two connection methods:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Client Portal API - Web-based connection using OAuth</li>
            <li>Trader Workstation (TWS) API - Direct connection to the TWS desktop application</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            We recommend using our dedicated integration page for a guided setup process.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
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
            variant="outline" 
            onClick={onConnect}
            disabled={isConnecting}
          >
            Quick Connect
          </Button>
        )}
        <Button onClick={handleGoToIntegration} className="flex items-center">
          Go to IBKR Setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InteractiveBrokersTabContent;
