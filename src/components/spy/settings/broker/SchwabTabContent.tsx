
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { SchwabCredentialsForm } from './SchwabCredentialsForm';
import { BrokerTabContentProps } from './types';
import { getSchwabCredentials } from '@/services/dataProviders/schwab/utils/credentialUtils';
import { Link } from 'react-router-dom';

const SchwabTabContent: React.FC<BrokerTabContentProps> = ({
  isConnecting = false,
  brokerStatus = '',
  onConnect,
  onDisconnect
}) => {
  const [showForm, setShowForm] = useState(false);
  const credentials = getSchwabCredentials();
  const hasCredentials = !!credentials?.apiKey;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Charles Schwab Integration</h3>
        {hasCredentials && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Hide Settings' : 'Edit Settings'}
          </Button>
        )}
      </div>
      
      {brokerStatus === 'connected' && (
        <Alert className="bg-green-50 border-green-300 text-green-900">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Connected</AlertTitle>
          <AlertDescription className="text-green-700">
            Successfully connected to Charles Schwab API.
          </AlertDescription>
        </Alert>
      )}
      
      {brokerStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Failed to connect to Charles Schwab API. Please check your credentials.
          </AlertDescription>
        </Alert>
      )}
      
      {(showForm || !hasCredentials) && (
        <SchwabCredentialsForm />
      )}
      
      {hasCredentials && !showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schwab API Credentials</CardTitle>
            <CardDescription>
              Your Schwab API connection is configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">API Key:</span>
                <span className="font-mono">{credentials.apiKey.substring(0, 6)}...{credentials.apiKey.substring(credentials.apiKey.length - 4)}</span>
              </div>
              {credentials.paperTrading && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                  Paper trading mode is enabled
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => onDisconnect && onDisconnect()}
              disabled={isConnecting}
            >
              Disconnect
            </Button>
            <Button 
              onClick={() => onConnect && onConnect()}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {!hasCredentials && (
        <div className="flex justify-center mt-6">
          <Link to="/schwab-integration">
            <Button className="flex items-center gap-2">
              <span>Visit Schwab Integration Guide</span>
              <ExternalLink size={16} />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SchwabTabContent;
