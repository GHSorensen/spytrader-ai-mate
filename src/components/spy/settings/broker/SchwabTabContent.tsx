
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, CheckCircle, AlertCircle, Info, LogIn, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BrokerSettings } from "@/lib/types/spy/broker";
import { DataProviderStatus } from "@/lib/types/spy/dataProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SchwabService } from "@/services/dataProviders/schwabService";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { schwabDocumentation } from "@/services/dataProviders/schwab/documentation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SchwabTabContentProps {
  settings: BrokerSettings;
  updateCredential: (key: string, value: string) => void;
  togglePaperTrading: (enabled: boolean) => void;
  testConnection: () => Promise<void>;
  isConnecting: boolean;
  status: DataProviderStatus;
}

export const SchwabTabContent: React.FC<SchwabTabContentProps> = ({
  settings,
  updateCredential,
  togglePaperTrading,
  testConnection,
  isConnecting,
  status,
}) => {
  const handleOAuthLogin = () => {
    try {
      // Create a temporary service to get the authorization URL
      const schwabService = new SchwabService({
        type: 'schwab',
        apiKey: settings.credentials.apiKey,
        secretKey: settings.credentials.secretKey,
        callbackUrl: settings.credentials.callbackUrl || window.location.origin + '/auth/callback',
        paperTrading: settings.paperTrading
      });
      
      // Store credentials in local storage temporarily
      localStorage.setItem('schwab_api_key', settings.credentials.apiKey || '');
      localStorage.setItem('schwab_secret_key', settings.credentials.secretKey || '');
      localStorage.setItem('schwab_paper_trading', settings.paperTrading.toString());
      
      // Get OAuth URL and redirect
      const authUrl = schwabService.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate OAuth flow:", error);
      // Handle error
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Schwab API Connection
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Connect to the Schwab API for automated trading.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Enter your Schwab Developer Portal credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schwab-app-key">App Machine Name</Label>
            <Input 
              id="schwab-app-key" 
              placeholder="Enter your Schwab App Machine Name"
              value={settings.credentials.appKey || ''}
              onChange={(e) => updateCredential('appKey', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This is your app's unique identifier in the Schwab Developer Portal
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schwab-api-key">Consumer Key</Label>
            <Input 
              id="schwab-api-key" 
              placeholder="Enter your Schwab Consumer Key"
              value={settings.credentials.apiKey || ''}
              onChange={(e) => updateCredential('apiKey', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schwab-secret-key">Consumer Secret</Label>
            <Input 
              id="schwab-secret-key" 
              type="password"
              placeholder="Enter your Schwab Consumer Secret"
              value={settings.credentials.secretKey || ''}
              onChange={(e) => updateCredential('secretKey', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schwab-callback-url">Callback URL</Label>
            <Input 
              id="schwab-callback-url" 
              placeholder="Enter your OAuth Callback URL"
              value={settings.credentials.callbackUrl || ''}
              onChange={(e) => updateCredential('callbackUrl', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This must match exactly what you entered in the Schwab Developer Portal
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="paper-trading-schwab">Paper Trading</Label>
              <div className="text-sm text-muted-foreground">
                Use paper trading account for testing
              </div>
            </div>
            <Switch
              id="paper-trading-schwab"
              checked={settings.paperTrading}
              onCheckedChange={togglePaperTrading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 items-stretch border-t pt-4">
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
          
          <Button 
            variant="default" 
            onClick={handleOAuthLogin} 
            disabled={!settings.credentials.apiKey || !settings.credentials.secretKey}
            className="w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Connect with OAuth
          </Button>
          
          <Button
            variant="outline"
            onClick={() => schwabDocumentation.openUserGuide()}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Schwab Guide
          </Button>
        </CardFooter>
      </Card>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="portal-steps">
          <AccordionTrigger>
            <span className="text-md font-medium">Schwab Developer Portal Setup Steps</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm">
            <div className="space-y-4 p-2">
              <Alert>
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  You must have a Schwab brokerage account before you can access the Developer Portal.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Step 1: Access the Developer Portal</h4>
                <p>Visit the <a href="https://developer.schwab.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Schwab Developer Portal</a> and sign in with your Schwab credentials.</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Step 2: Create a New Application</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Go to the "My Apps" section</li>
                  <li>Click "Create New App"</li>
                  <li>Enter an App Name (e.g., "SPY Trading AI")</li>
                  <li>For Application Type, select "Web Application"</li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Step 3: Configure OAuth Settings</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Enter a Redirect URI: <code>{window.location.origin}/auth/callback</code></li>
                  <li>Select the required scopes:
                    <ul className="list-disc pl-5">
                      <li>openid</li>
                      <li>profile</li>
                      <li>offline_access</li>
                      <li>trade</li>
                      <li>accounts</li>
                    </ul>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Step 4: Get Your API Credentials</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>After creating your app, you'll receive:
                    <ul className="list-disc pl-5">
                      <li>App Machine Name (enter in "App Machine Name" field)</li>
                      <li>Consumer Key (enter in "Consumer Key" field)</li>
                      <li>Consumer Secret (enter in "Consumer Secret" field)</li>
                    </ul>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Step 5: Configure Account Access</h4>
                <p>In the Developer Portal, verify which accounts your application has access to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Go to "Account Preferences"</li>
                  <li>Ensure your target brokerage account is selected for API access</li>
                  <li>If using Paper Trading, make sure to select that account specifically</li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Step 6: Enable API Access</h4>
                <p>Some accounts may require additional verification before API access is granted:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check your account settings in the main Schwab portal</li>
                  <li>Look for "API Access" or "Developer Access" settings</li>
                  <li>You may need to accept additional terms and conditions</li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Need More Help?</h4>
                <p>
                  For detailed instructions, refer to the <Button variant="link" className="p-0 h-auto font-normal text-blue-500" onClick={() => schwabDocumentation.openUserGuide()}>Schwab User Guide</Button> or contact Schwab Developer Support.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="troubleshooting">
          <AccordionTrigger>
            <span className="text-md font-medium">Troubleshooting Connection Issues</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm">
            <div className="space-y-4 p-2">
              <div className="space-y-1">
                <h4 className="font-semibold">Invalid Redirect URI</h4>
                <p>If you see an "invalid redirect URI" error:</p>
                <ul className="list-disc pl-5">
                  <li>Ensure the Redirect URI in the Schwab Developer Portal exactly matches: <code>{window.location.origin}/auth/callback</code></li>
                  <li>Check for trailing slashes or typos</li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Invalid Scope</h4>
                <p>If you see an "invalid scope" error:</p>
                <ul className="list-disc pl-5">
                  <li>Make sure all required scopes are enabled for your app</li>
                  <li>You may need to recreate your app with the correct scopes</li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Authentication Errors</h4>
                <p>If authentication fails:</p>
                <ul className="list-disc pl-5">
                  <li>Verify your Consumer Key and Secret are entered correctly</li>
                  <li>Check that your app is approved and active in the Developer Portal</li>
                  <li>Ensure you're signed in to your Schwab account</li>
                </ul>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">Account Access Issues</h4>
                <p>If you can't access your accounts:</p>
                <ul className="list-disc pl-5">
                  <li>Verify the account is enabled for API access in the Schwab portal</li>
                  <li>For paper trading, make sure you have a paper trading account set up</li>
                  <li>Some account types may have restrictions on API access</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SchwabTabContent;
