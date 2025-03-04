import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import IBKRHeader from './IBKRHeader';
import IBKRPrerequisites from './IBKRPrerequisites';
import IBKRIntegrationSteps from './IBKRIntegrationSteps';
import IBKRCredentialsForm from './IBKRCredentialsForm';
import IBKRApiKeyInfo from './IBKRApiKeyInfo';
import IBKRActionButtons from './IBKRActionButtons';
import ConnectionStatus from './ConnectionStatus';
import IBKRStatusIndicator from './IBKRStatusIndicator';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface IBKRIntegrationViewProps {
  isConnecting: boolean;
  isConfigured: boolean;
  apiMethod: 'webapi' | 'tws';
  setApiMethod: (method: 'webapi' | 'tws') => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  callbackUrl: string;
  setCallbackUrl: (url: string) => void;
  twsHost: string;
  setTwsHost: (host: string) => void;
  twsPort: string;
  setTwsPort: (port: string) => void;
  isPaperTrading: boolean;
  setIsPaperTrading: (value: boolean) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  dataStatus?: {
    isConnected: boolean;
    dataSource: 'live' | 'delayed' | 'mock';
    refreshData: () => void;
  };
  onBackToDashboard: () => void;
  onTestConnection: () => void;
  onStartAuth: () => void;
  onTwsConnect: () => void;
}

const IBKRIntegrationView: React.FC<IBKRIntegrationViewProps> = ({
  isConnecting,
  isConfigured,
  apiMethod,
  setApiMethod,
  apiKey,
  setApiKey,
  callbackUrl,
  setCallbackUrl,
  twsHost,
  setTwsHost,
  twsPort,
  setTwsPort,
  isPaperTrading,
  setIsPaperTrading,
  connectionStatus,
  dataStatus,
  onBackToDashboard,
  onTestConnection,
  onStartAuth,
  onTwsConnect
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <IBKRHeader />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="flex flex-col items-center max-w-4xl mx-auto">
          <Card className="w-full shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Connect to Interactive Brokers</CardTitle>
                  <CardDescription>
                    Link your Interactive Brokers account to enable automated trading with SPY Trading AI
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <ConnectionStatus status={connectionStatus} />
                  {isConfigured && dataStatus && (
                    <IBKRStatusIndicator showDetails={true} />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <IBKRApiKeyInfo />
              <IBKRPrerequisites />
              
              {apiMethod === 'webapi' && (
                <IBKRIntegrationSteps callbackUrl={callbackUrl} />
              )}
              
              <Separator />
              
              <IBKRCredentialsForm
                apiKey={apiKey}
                setApiKey={setApiKey}
                callbackUrl={callbackUrl}
                setCallbackUrl={setCallbackUrl}
                twsHost={twsHost}
                setTwsHost={setTwsHost}
                twsPort={twsPort}
                setTwsPort={setTwsPort}
                apiMethod={apiMethod}
                setApiMethod={setApiMethod}
                isConnecting={isConnecting}
                isPaperTrading={isPaperTrading}
                setIsPaperTrading={setIsPaperTrading}
              />
            </CardContent>
            
            <CardFooter>
              <IBKRActionButtons
                isConnecting={isConnecting}
                isConfigured={isConfigured}
                apiMethod={apiMethod}
                apiKey={apiKey}
                twsHost={twsHost}
                twsPort={twsPort}
                onBackToDashboard={onBackToDashboard}
                onTestConnection={onTestConnection}
                onStartAuth={onStartAuth}
                onTwsConnect={onTwsConnect}
              />
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={() => navigate('/ibkr/debug')}
        >
          <Bug className="h-4 w-4 mr-2" />
          Advanced Diagnostics
        </Button>
      </div>
    </div>
  );
};

export default IBKRIntegrationView;
