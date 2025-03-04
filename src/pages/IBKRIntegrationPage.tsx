
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';
import { Separator } from "@/components/ui/separator";
import { ExternalLink, ArrowRight, Terminal, Info, CheckCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { ibkrDocumentation } from '@/services/dataProviders/interactiveBrokers/documentation';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <header className="border-b">
        <div className="container py-4">
          <SpyHeaderWithNotifications />
        </div>
      </header>
      
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
              <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-400">Important: Authentication Method</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-300">
                  This integration uses OAuth with IBKR's Client Portal API. You do NOT enter your IBKR username and password here.
                  Instead, you'll need to create a Client ID in your IBKR account settings first.
                </AlertDescription>
              </Alert>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Prerequisites
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>You need an active Interactive Brokers account (IBKR Pro)</li>
                  <li>Trader Workstation (TWS) or IB Gateway must be running</li>
                  <li>Client Portal API must be enabled in your account settings</li>
                  <li>You need to have created API credentials in the IBKR dashboard</li>
                </ul>
                <div className="mt-4 text-sm flex flex-col space-y-2">
                  <a 
                    href="#" 
                    onClick={(e) => {e.preventDefault(); ibkrDocumentation.openAPISettings();}}
                    className="flex items-center text-primary hover:underline"
                  >
                    <span>Go to IBKR API Settings to Create Client ID</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <a 
                    href="#" 
                    onClick={(e) => {e.preventDefault(); ibkrDocumentation.openClientIDHelp();}}
                    className="flex items-center text-primary hover:underline"
                  >
                    <span>How to Create a Client ID (Documentation)</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <a 
                    href="#" 
                    onClick={(e) => {e.preventDefault(); ibkrDocumentation.openUserGuide();}}
                    className="flex items-center text-primary hover:underline"
                  >
                    <span>IBKR Web API Documentation</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium mb-2 flex items-center text-blue-700 dark:text-blue-400">
                  <Info className="h-4 w-4 mr-2" />
                  Integration Steps
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li>Log in to your IBKR account on their website</li>
                  <li>Navigate to User Settings &gt; API Settings</li>
                  <li>Register a new API application to get your Client ID</li>
                  <li>Add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">{callbackUrl}</code> as an allowed redirect URL</li>
                  <li>Copy your Client ID and paste it in the field below</li>
                  <li>Click "Connect to IBKR" to initiate the OAuth process</li>
                  <li>You'll be redirected to IBKR to log in with your username and password</li>
                </ol>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="apiKey" className="text-sm font-medium flex items-center">
                    <span>IBKR Client ID (API Key)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            This is NOT your IBKR username or password. It's the Client ID you generate in IBKR API Settings. 
                            Look for "Register a new API application" in your IBKR account settings.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your IBKR Client ID (not your username/password)"
                    className="w-full p-2 border rounded-md"
                    disabled={isConnecting}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="callbackUrl" className="text-sm font-medium flex items-center">
                    <span>Callback URL (must match URL configured in IBKR)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80 text-xs">This URL must be registered in your IBKR API Settings as an authorized redirect URL. After authorization, IBKR will redirect back to this URL.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <div className="flex items-center">
                    <input
                      id="callbackUrl"
                      type="text"
                      value={callbackUrl}
                      onChange={(e) => setCallbackUrl(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      disabled={isConnecting}
                    />
                    {callbackUrl === `${window.location.origin}/auth/ibkr/callback` && (
                      <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                disabled={isConnecting}
              >
                Back to Dashboard
              </Button>
              
              <div className="space-x-4">
                {isConfigured && (
                  <Button 
                    variant="secondary" 
                    onClick={handleTestConnection}
                    disabled={isConnecting}
                  >
                    Test Connection
                  </Button>
                )}
                
                <Button 
                  onClick={handleStartAuth} 
                  disabled={isConnecting || !apiKey}
                  className="flex items-center"
                >
                  {isConnecting ? "Connecting..." : (isConfigured ? "Reconnect" : "Connect to IBKR")}
                  {!isConnecting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default IBKRIntegrationPage;
