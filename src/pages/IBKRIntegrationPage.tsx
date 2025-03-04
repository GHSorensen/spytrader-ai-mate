
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

// Import refactored components
import IBKRHeader from '@/components/ibkr/IBKRHeader';
import IBKRPrerequisites from '@/components/ibkr/IBKRPrerequisites';
import IBKRIntegrationSteps from '@/components/ibkr/IBKRIntegrationSteps';
import IBKRCredentialsForm from '@/components/ibkr/IBKRCredentialsForm';
import IBKRApiKeyInfo from '@/components/ibkr/IBKRApiKeyInfo';
import IBKRActionButtons from '@/components/ibkr/IBKRActionButtons';

const IBKRIntegrationPage: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [callbackUrl, setCallbackUrl] = useState(`${window.location.origin}/auth/ibkr/callback`);
  const [isConfigured, setIsConfigured] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check local storage for existing IBKR config
    const savedConfig = localStorage.getItem('ibkr-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.apiKey) {
          setApiKey(config.apiKey);
          setCallbackUrl(config.callbackUrl || callbackUrl);
          setIsConfigured(true);
        }
      } catch (err) {
        console.error("Error parsing saved IBKR config:", err);
      }
    }
  }, []);
  
  const handleStartAuth = async () => {
    try {
      setIsConnecting(true);
      
      if (!apiKey) {
        toast.error("Please enter your API Key");
        setIsConnecting(false);
        return;
      }
      
      // Save config to local storage
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        apiKey,
        callbackUrl
      };
      
      localStorage.setItem('ibkr-config', JSON.stringify(config));
      
      // Initialize auth handler
      const ibkrAuth = new IBKRAuth(config);
      
      // Get authorization URL
      const authUrl = ibkrAuth.getAuthorizationUrl();
      
      // Redirect to IBKR auth page
      console.log("Redirecting to IBKR auth URL:", authUrl);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("Error starting IBKR auth process:", error);
      toast.error("Failed to connect to Interactive Brokers. Please try again.");
      setIsConnecting(false);
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleTestConnection = async () => {
    try {
      setIsConnecting(true);
      
      // Get saved config
      const savedConfig = localStorage.getItem('ibkr-config');
      if (!savedConfig) {
        toast.error("No IBKR configuration found. Please connect first.");
        setIsConnecting(false);
        return;
      }
      
      const config = JSON.parse(savedConfig);
      
      // Initialize data provider
      const ibkrProvider = getDataProvider(config);
      
      // Test connection
      const connected = await ibkrProvider.connect();
      
      if (connected) {
        toast.success("Successfully connected to Interactive Brokers!");
      } else {
        toast.error("Failed to connect to Interactive Brokers. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error testing IBKR connection:", error);
      toast.error("Connection test failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };
  
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
              <IBKRIntegrationSteps callbackUrl={callbackUrl} />
              
              <Separator />
              
              <IBKRCredentialsForm
                apiKey={apiKey}
                setApiKey={setApiKey}
                callbackUrl={callbackUrl}
                setCallbackUrl={setCallbackUrl}
                isConnecting={isConnecting}
              />
            </CardContent>
            
            <CardFooter>
              <IBKRActionButtons
                isConnecting={isConnecting}
                isConfigured={isConfigured}
                apiKey={apiKey}
                onBackToDashboard={handleBackToDashboard}
                onTestConnection={handleTestConnection}
                onStartAuth={handleStartAuth}
              />
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default IBKRIntegrationPage;
