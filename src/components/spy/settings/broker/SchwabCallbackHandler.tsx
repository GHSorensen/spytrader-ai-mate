import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SchwabAuthManager } from '@/services/dataProviders/schwab/SchwabAuthManager';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { config } from '@/config/environment';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logError, trackEvent } from '@/lib/errorMonitoring';

export const SchwabCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    const processCallback = async () => {
      try {
        if (!code || !state) {
          throw new Error('Missing required parameters in callback URL');
        }
        
        trackEvent('broker_callback_received', { broker: 'schwab' });
        console.log('Authorization code received:', code.substring(0, 5) + '...');
        console.log('State parameter received:', state.substring(0, 5) + '...');
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Store callback params in localStorage for later use
          localStorage.setItem('schwab_auth_code', code);
          localStorage.setItem('schwab_auth_state', state);
          
          setMessage('You need to log in before connecting your brokerage account');
          setTimeout(() => {
            navigate('/auth', { state: { returnTo: '/dashboard' } });
          }, 2000);
          return;
        }
        
        // Create provider config
        const providerConfig: DataProviderConfig = {
          type: 'schwab',
          apiKey: '',
          secretKey: '',
          callbackUrl: config.authRedirectUrl,
          refreshToken: '',
          paperTrading: false
        };
        
        // Initialize auth manager with handlers
        const authManager = new SchwabAuthManager(
          providerConfig,
          (accessToken, refreshToken, expiryTime) => {
            console.log('Received tokens with expiry:', expiryTime);
            // In production, you would store these tokens securely
          },
          (connected, errorMessage) => {
            if (connected) {
              setStatus('success');
              setMessage('Successfully connected to Schwab!');
              toast({
                title: 'Connection Successful',
                description: 'Your Schwab account has been successfully connected.',
              });
              trackEvent('broker_connection_success', { broker: 'schwab' });
            } else {
              setStatus('error');
              setMessage(errorMessage || 'Failed to connect to Schwab');
              toast({
                variant: 'destructive',
                title: 'Connection Failed',
                description: errorMessage || 'Failed to connect to Schwab',
              });
              logError(new Error(errorMessage || 'Unknown connection error'), { 
                broker: 'schwab', 
                code: 'present' 
              });
            }
          }
        );
        
        // Process the callback
        const success = await authManager.handleOAuthCallback(code, state);
        
        // Handle result
        if (success) {
          setStatus('success');
          setMessage('Successfully connected to Schwab!');
          
          // Set timeout to navigate back to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          throw new Error('Failed to connect to Schwab');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during authentication');
        
        logError(error, {
          component: 'SchwabCallbackHandler',
          location: location.pathname + location.search
        });
        
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: error.message || 'An error occurred during authentication',
        });
      }
    };
    
    processCallback();
  }, [location, navigate, toast]);
  
  const handleReturn = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            
            {status === 'loading' ? 'Connecting to Schwab' : 
             status === 'success' ? 'Connection Successful' : 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Please wait while we process your authentication...' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700">{message}</p>
          
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              <p className="font-semibold">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Check if your Schwab account has API access enabled</li>
                <li>Ensure you've authorized the correct permissions</li>
                <li>Try logging out and logging back in</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleReturn} className="w-full">
            {status === 'loading' ? 'Cancel' : 'Return to Dashboard'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
