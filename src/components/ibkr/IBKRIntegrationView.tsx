
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import IBKRHeader from './IBKRHeader';
import IBKRPrerequisites from './IBKRPrerequisites';
import IBKRIntegrationSteps from './IBKRIntegrationSteps';
import IBKRCredentialsForm from './IBKRCredentialsForm';
import IBKRApiKeyInfo from './IBKRApiKeyInfo';
import IBKRActionButtons from './IBKRActionButtons';

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
  onBackToDashboard,
  onTestConnection,
  onStartAuth,
  onTwsConnect
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <IBKRHeader />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="flex flex-col items-center max-w-4xl mx-auto">
          <Card className="w-full shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Connect to Interactive Brokers</CardTitle>
              <CardDescription>
                Link your Interactive Brokers account to enable automated trading with SPY Trading AI
              </CardDescription>
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
    </div>
  );
};

export default IBKRIntegrationView;
