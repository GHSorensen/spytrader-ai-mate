
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Settings } from "lucide-react";

const IBKRIntegrationPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        connectionMethod: 'tws', // Using TWS as default as it's more reliable for testing
        twsHost: 'localhost',
        twsPort: '7496',
        paperTrading: true
      };

      const service = new InteractiveBrokersService(config);
      const connected = await service.connect();

      // Get diagnostics after connection attempt
      const diagnosticInfo = service.getDiagnostics();
      setDiagnostics(diagnosticInfo);

      if (connected) {
        setIsConnected(true);
        toast.success('Connected to Interactive Brokers successfully');
      } else {
        const errorMessage = diagnosticInfo.lastError ? 
          `Failed to connect: ${diagnosticInfo.lastError.message}` : 
          'Failed to connect to Interactive Brokers';
        
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Connection error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">IBKR Integration</h1>
      
      <Alert variant="info" className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Configuration Required</AlertTitle>
        <AlertDescription>
          Before connecting, make sure that TWS or IB Gateway is running and that API connections are enabled.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Check your connection to Interactive Brokers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {isConnected 
                ? 'You are now connected to Interactive Brokers. You can start trading.' 
                : 'You are not currently connected to Interactive Brokers. Please configure your connection settings.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting || isConnected}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Quick Connect to TWS (localhost)'}
              </Button>
              
              <Link to="/ibkr/debug" className="block">
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Advanced Connection Settings
                </Button>
              </Link>
            </div>
            
            {diagnostics && diagnostics.lastError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                <p className="font-semibold">Connection error:</p>
                <p>{diagnostics.lastError.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Tools</CardTitle>
            <CardDescription>Troubleshoot connection issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              If you're having trouble connecting to Interactive Brokers, our diagnostic tools can help identify the issue.
            </p>
            <Link to="/ibkr/debug" className="block">
              <Button variant="outline" className="w-full">Open Diagnostics</Button>
            </Link>
            
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Common Connection Issues:</h3>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>TWS or IB Gateway not running</li>
                <li>API connections not enabled in TWS settings</li>
                <li>Incorrect port number (7496 for live, 7497 for paper)</li>
                <li>Firewall blocking the connection</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Make sure you have an active Interactive Brokers account</li>
          <li>Install and log in to Trader Workstation (TWS) or IB Gateway</li>
          <li>Configure API settings in TWS (Edit → Global Configuration → API → Settings)</li>
          <li>Enable "Socket port" and note the port number (usually 7496 for live or 7497 for paper)</li>
          <li>Disable "Read-Only API" to allow trading operations</li>
          <li>Click Connect to establish a connection</li>
        </ol>
      </div>
      
      <div className="mt-8 bg-gray-50 p-4 rounded-md border">
        <h2 className="text-xl font-semibold mb-2">TWS API Requirements</h2>
        <div className="space-y-2">
          <p className="text-sm">To use the TWS API, you need:</p>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li>Interactive Brokers account (paper or live)</li>
            <li>Trader Workstation (TWS) or IB Gateway installed and running</li>
            <li>API connections enabled in TWS settings</li>
          </ul>
          <p className="text-sm mt-2">
            <a 
              href="https://interactivebrokers.github.io/tws-api/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View IBKR API Documentation →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IBKRIntegrationPage;
