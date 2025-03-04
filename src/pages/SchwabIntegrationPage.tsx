
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Check, ExternalLink, Info } from "lucide-react";
import SpyHeaderWithNotifications from '@/components/spy/SpyHeaderWithNotifications';
import { schwabDocumentation } from '@/services/dataProviders/schwab/documentation';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SchwabIntegrationPage = () => {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  
  const handleConnectToSchwab = () => {
    setConnecting(true);
    // In a real implementation, we would use the Schwab service to get the authorization URL
    // For now, we'll simulate the authentication flow with a timeout
    setTimeout(() => {
      navigate('/auth/callback?code=mock_auth_code&state=mock_state');
    }, 1500);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <SpyHeaderWithNotifications />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <span className="text-primary">Schwab Integration</span>
              </CardTitle>
              <CardDescription>
                Connect your Charles Schwab account to SPY Trading AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    SPY Trading AI can connect to your Charles Schwab brokerage account to enable 
                    paper trading and live trading capabilities. We use OAuth2 authentication for
                    secure connection without storing your credentials.
                  </p>
                  
                  <Alert variant="default" className="bg-primary/10 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>Secure OAuth Integration</AlertTitle>
                    <AlertDescription>
                      Your Schwab credentials are never stored or accessed by SPY Trading AI. 
                      All authentication is handled securely through Schwab's official API.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold">Paper Trading</h3>
                      <p className="text-sm text-muted-foreground">
                        Practice without risk using simulated trades that mirror real market conditions.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold">Live Trading</h3>
                      <p className="text-sm text-muted-foreground">
                        Execute real trades with SPY options using AI-enhanced strategies and risk management.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4 mt-8">
                    <Button 
                      size="lg" 
                      className="w-full md:w-auto px-8"
                      onClick={handleConnectToSchwab}
                      disabled={connecting}
                    >
                      {connecting ? 'Connecting...' : 'Connect to Schwab'}
                      {!connecting && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      You'll be redirected to Schwab to authorize the connection
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="setup" className="space-y-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Step 1: Prepare Your Schwab Account
                      </h3>
                      <p className="text-sm text-muted-foreground ml-6">
                        Ensure you have a Schwab brokerage account with options trading permissions.
                        If you don't have options permissions, apply through Schwab's website.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Step 2: Connect Your Account
                      </h3>
                      <p className="text-sm text-muted-foreground ml-6">
                        Click the "Connect to Schwab" button and log in with your Schwab credentials.
                        Review and authorize the requested permissions.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Step 3: Select Account & Trading Mode
                      </h3>
                      <p className="text-sm text-muted-foreground ml-6">
                        Choose which Schwab account to use and select between paper trading or live trading.
                        For beginners, we recommend starting with paper trading.
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => schwabDocumentation.openUserGuide()}
                      className="w-full"
                    >
                      View Complete Setup Guide
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Connection Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Your connection to Schwab uses OAuth2, which requires periodic reauthentication for security.
                      Tokens typically expire after 24 hours of inactivity.
                    </p>
                    
                    <h3 className="font-semibold">Data Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      SPY Trading AI only receives the data necessary for trading, such as account balances,
                      positions, and order status. We never see your Schwab login credentials.
                    </p>
                    
                    <h3 className="font-semibold">Troubleshooting</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Common connection issues:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 space-y-1">
                        <li>Expired session (resolve by reconnecting)</li>
                        <li>Insufficient account permissions (check with Schwab)</li>
                        <li>Network connectivity problems (check your internet)</li>
                      </ul>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => schwabDocumentation.downloadUserGuide()}
                      className="w-full mt-4"
                    >
                      Download Technical Documentation
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">Not Connected</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your Schwab account to enable trading capabilities and view your portfolio.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleConnectToSchwab}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : 'Connect Account'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Is my data secure?</h3>
                <p className="text-xs text-muted-foreground">
                  Yes. We use OAuth2 for authentication and never store your Schwab credentials.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">What permissions are required?</h3>
                <p className="text-xs text-muted-foreground">
                  We request access to view account information and execute trades on your behalf.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Can I disconnect at any time?</h3>
                <p className="text-xs text-muted-foreground">
                  Yes. You can disconnect your Schwab account from the settings page or your Schwab account.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">What if I have multiple Schwab accounts?</h3>
                <p className="text-xs text-muted-foreground">
                  After connecting, you'll be able to select which account to use with SPY Trading AI.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-xs"
                onClick={() => schwabDocumentation.openUserGuide()}
              >
                View All FAQs
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchwabIntegrationPage;
