
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { SchwabService } from "@/services/dataProviders/schwabService";
import { toast } from "@/components/ui/use-toast";

export const SchwabCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const processOAuthCallback = async () => {
      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from Schwab');
        return;
      }

      try {
        console.log(`Processing OAuth callback with code: ${code.substring(0, 5)}... and state: ${state?.substring(0, 5)}...`);
        
        // Retrieve temporary credentials from localStorage
        const apiKey = localStorage.getItem('schwab_api_key');
        const secretKey = localStorage.getItem('schwab_secret_key');
        const paperTrading = localStorage.getItem('schwab_paper_trading') === 'true';
        
        if (!apiKey) {
          throw new Error('Missing API credentials in local storage');
        }

        // Create a temporary service to handle the callback
        const tempService = new SchwabService({
          type: 'schwab',
          apiKey,
          secretKey,
          callbackUrl: window.location.origin + '/auth/callback',
          paperTrading
        });

        // Process the callback
        const success = await tempService.handleOAuthCallback(code, state || undefined);

        if (success) {
          setStatus('success');
          toast({
            title: "Schwab Connected Successfully",
            description: "Your Schwab account has been connected. You can now proceed to trade.",
          });
          
          // Clean up localStorage
          localStorage.removeItem('schwab_api_key');
          localStorage.removeItem('schwab_secret_key');
          localStorage.removeItem('schwab_paper_trading');
        } else {
          throw new Error('Failed to complete OAuth flow');
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        
        toast({
          title: "Connection Failed",
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: "destructive",
        });
      }
    };

    processOAuthCallback();
  }, [searchParams]);

  const handleReturnToSettings = () => {
    navigate('/');
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            Schwab Authentication
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your authentication with Schwab...'}
            {status === 'success' && 'Successfully connected to Schwab!'}
            {status === 'error' && 'Failed to connect to Schwab'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">
                This may take a few moments while we establish a secure connection with Schwab...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="py-6">
              <p className="text-center mb-4">
                Your Schwab account has been successfully connected. You can now return to the application and start trading.
              </p>
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="py-6">
              <p className="text-center mb-4 text-red-500 font-medium">
                Authentication Error
              </p>
              <p className="text-center mb-6">
                {errorMessage || 'An unexpected error occurred while connecting to Schwab.'}
              </p>
              <div className="space-y-4 text-sm">
                <p className="font-medium">Possible solutions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify your Schwab API credentials in the settings</li>
                  <li>Make sure your Schwab app is properly configured</li>
                  <li>Check that your callback URL is correctly set in the Schwab Developer Portal</li>
                  <li>Try the connection process again</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleReturnToSettings} 
            className="w-full"
            variant={status === 'error' ? "destructive" : "default"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SchwabCallbackHandler;
