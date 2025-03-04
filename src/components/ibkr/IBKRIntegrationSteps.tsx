
import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

interface IBKRIntegrationStepsProps {
  callbackUrl: string;
}

const IBKRIntegrationSteps: React.FC<IBKRIntegrationStepsProps> = ({ callbackUrl }) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
      <h3 className="font-medium mb-2 flex items-center text-blue-700 dark:text-blue-400">
        <Info className="h-4 w-4 mr-2" />
        Client Portal API Integration Steps
      </h3>
      
      <div className="mb-3 flex items-start p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-sm">
        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Finding API Settings in IBKR:</p>
          <p>The API settings location may vary in IBKR's interface. Look for:</p>
          <ul className="list-disc list-inside pl-2 mt-1">
            <li>Under "Users & Access Rights" → "Access Rights"</li>
            <li>Under "Security" → "API Configuration"</li>
            <li>Or search for "API" in IBKR's account management search</li>
          </ul>
        </div>
      </div>
      
      <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
        <li>Log in to your IBKR account on their website</li>
        <li>Navigate to API Settings in your IBKR account (locations listed above)</li>
        <li>Register a new API application to get your Client ID</li>
        <li>Add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">{callbackUrl}</code> as an allowed redirect URL</li>
        <li>Copy your Client ID and paste it in the field below</li>
        <li>Click "Connect to IBKR Web API" to initiate the OAuth process</li>
        <li>You'll be redirected to IBKR to log in with your username and password</li>
      </ol>
      
      <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">
        If you're having trouble finding the API settings, consider using the TWS API option instead, 
        which is often simpler to set up.
      </p>
    </div>
  );
};

export default IBKRIntegrationSteps;
