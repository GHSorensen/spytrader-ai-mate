
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { Loader2 } from 'lucide-react';

const IBKRCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get auth code from URL
        const authCode = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error("IBKR auth error:", error, errorDescription);
          setErrorMessage(errorDescription || "Authorization failed. Please try again.");
          setIsProcessing(false);
          setSuccess(false);
          return;
        }
        
        if (!authCode) {
          console.error("No auth code found in callback URL");
          setErrorMessage("No authorization code received from Interactive Brokers. Please try again.");
          setIsProcessing(false);
          setSuccess(false);
          return;
        }
        
        console.log("Received auth code from IBKR:", authCode);
        
        // Get saved config
        const savedConfig = localStorage.getItem('ibkr-config');
        if (!savedConfig) {
          console.error("No IBKR configuration found");
          setErrorMessage("Configuration not found. Please restart the connection process.");
          setIsProcessing(false);
          setSuccess(false);
          return;
        }
        
        const config = JSON.parse(savedConfig) as DataProviderConfig;
        
        // Initialize auth handler
        const ibkrAuth = new IBKRAuth(config);
        
        // Exchange auth code for token
        const tokenResult = await ibkrAuth.getAccessToken(authCode);
        console.log("Received tokens from IBKR:", tokenResult);
        
        // Update config with tokens
        const updatedConfig: DataProviderConfig = {
          ...config,
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken
        };
        
        // Save updated config
        localStorage.setItem('ibkr-config', JSON.stringify(updatedConfig));
        
        // Update state
        setSuccess(true);
        toast.success("Successfully connected to Interactive Brokers!");
        
      } catch (error) {
        console.error("Error processing IBKR callback:", error);
        setErrorMessage("Failed to complete authentication. Please try again.");
        setSuccess(false);
      } finally {
        setIsProcessing(false);
      }
    };
    
    processCallback();
  }, [searchParams, navigate]);
  
  const handleContinue = () => {
    navigate('/dashboard');
  };
  
  const handleRetry = () => {
    navigate('/ibkr-integration');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isProcessing ? "Processing" : success ? "Connection Successful" : "Connection Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {isProcessing 
              ? "Finalizing your Interactive Brokers connection..." 
              : success 
                ? "Your Interactive Brokers account has been successfully linked."
                : "There was a problem connecting your account."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-6">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Please wait, this may take a moment...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                You can now use SPY Trading AI with your Interactive Brokers account.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 max-w-xs">
                {errorMessage || "An unexpected error occurred. Please try again."}
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {isProcessing ? (
            <Button disabled>Please wait...</Button>
          ) : success ? (
            <Button onClick={handleContinue}>Continue to Dashboard</Button>
          ) : (
            <Button variant="outline" onClick={handleRetry}>Try Again</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default IBKRCallbackPage;
