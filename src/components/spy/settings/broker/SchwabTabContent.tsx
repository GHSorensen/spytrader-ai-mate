
import React from 'react';
import { SchwabCredentialsForm } from './SchwabCredentialsForm';
import { Button } from '@/components/ui/button';
import { getSchwabCredentials } from '@/services/dataProviders/schwab/utils/credentialUtils';
import { SchwabService } from '@/services/dataProviders/schwab/SchwabService';
import { useNavigate } from 'react-router-dom';

const SchwabTabContent: React.FC = () => {
  const navigate = useNavigate();
  const credentials = getSchwabCredentials();
  
  // Handle connect to Schwab
  const handleConnect = () => {
    if (!credentials) {
      console.error('Schwab credentials not found');
      return;
    }
    
    try {
      const schwabService = new SchwabService(credentials);
      const authUrl = schwabService.getAuthorizationUrl();
      
      // Redirect to Schwab authorization page
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error starting Schwab OAuth flow:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium">Schwab API Integration</h3>
        <p className="text-sm text-muted-foreground">
          Connect to Charles Schwab for trading and account management
        </p>
      </div>
      
      <SchwabCredentialsForm />
      
      {credentials && credentials.apiKey && (
        <div className="flex justify-end">
          <Button onClick={handleConnect}>
            Connect to Schwab
          </Button>
        </div>
      )}
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Setting up Schwab API</h4>
        <ol className="list-decimal pl-5 text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <li>Register as a developer on the Schwab Developer Portal</li>
          <li>Create a new application to get your API Key and Secret Key</li>
          <li>Set up the OAuth Callback URL in your Schwab Developer Portal settings</li>
          <li>Enter these credentials above and click "Save Credentials"</li>
          <li>Once credentials are saved, click "Connect to Schwab" to authorize the application</li>
        </ol>
      </div>
    </div>
  );
};

export default SchwabTabContent;
