
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { SchwabService } from "@/services/dataProviders/schwabService";
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { useBrokerSettings } from "@/hooks/useBrokerSettings";

export const SchwabOAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Parse query parameters from the URL
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        // Check for errors from OAuth provider
        if (error) {
          throw new Error(errorDescription || `Authentication error: ${error}`);
        }
        
        // Check if we have an authorization code
        if (!code) {
          throw new Error("No authorization code received");
        }
        
        // TODO: In a real application, we would get the broker settings from state management
        // For now, we'll create a temporary service instance
        const config: DataProviderConfig = {
          type: 'schwab',
          apiKey: localStorage.getItem('schwab_api_key') || undefined,
          secretKey: localStorage.getItem('schwab_secret_key') || undefined,
          callbackUrl: window.location.origin + '/auth/callback',
          paperTrading: localStorage.getItem('schwab_paper_trading') === 'true'
        };
        
        const schwabService = new SchwabService(config);
        
        // Process the authorization code
        const success = await schwabService.handleOAuthCallback(code, state || undefined);
        
        if (success) {
          setStatus("success");
          
          // In a real application, we would update the broker settings with the new tokens
          // and connection status
          
          toast({
            title: "Authentication Successful",
            description: "Successfully connected to Schwab API",
          });
          
          // Redirect after short delay
          setTimeout(() => {
            navigate("/settings");
          }, 2000);
        } else {
          throw new Error("Failed to authenticate with Schwab");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Unknown error during authentication");
        
        toast({
          title: "Authentication Failed",
          description: error instanceof Error ? error.message : "Unknown error during authentication",
          variant: "destructive",
        });
      }
    };
    
    handleOAuthCallback();
  }, [location.search, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Schwab Authentication</CardTitle>
          <CardDescription>
            {status === "loading" && "Processing your authentication..."}
            {status === "success" && "Authentication successful!"}
            {status === "error" && "Authentication failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Please wait while we complete the authentication process...
              </p>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg 
                  className="h-6 w-6 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <p className="text-center text-muted-foreground">
                You have successfully connected to Schwab. Redirecting you back to the application...
              </p>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg 
                  className="h-6 w-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </div>
              <p className="text-center text-red-500 font-medium mb-2">
                Authentication Error
              </p>
              <p className="text-center text-muted-foreground">
                {errorMessage || "An unknown error occurred during the authentication process."}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
