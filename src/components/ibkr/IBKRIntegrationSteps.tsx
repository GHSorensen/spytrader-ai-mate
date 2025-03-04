
import React from 'react';
import { Info } from 'lucide-react';

interface IBKRIntegrationStepsProps {
  callbackUrl: string;
}

const IBKRIntegrationSteps: React.FC<IBKRIntegrationStepsProps> = ({ callbackUrl }) => {
  return (
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
  );
};

export default IBKRIntegrationSteps;
