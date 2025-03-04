
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { ibkrDocumentation } from '@/services/dataProviders/interactiveBrokers/documentation';

const IBKRApiKeyInfo: React.FC = () => {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-700 dark:text-blue-400" />
      <AlertTitle className="text-blue-700 dark:text-blue-400">IBKR Connection Methods</AlertTitle>
      <AlertDescription className="text-blue-600 dark:text-blue-300 space-y-2">
        <p>
          SPY Trading AI offers two ways to connect to your IBKR account:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong>Client Portal API (Web)</strong>: Uses OAuth for authentication but requires setup in your IBKR account settings. 
            More suitable for server-based trading.
            <button 
              onClick={() => ibkrDocumentation.openAPISettings()} 
              className="text-xs ml-2 text-blue-700 dark:text-blue-400 hover:underline focus:outline-none"
            >
              IBKR API Settings Page
            </button>
          </li>
          <li>
            <strong>TWS API (Desktop)</strong>: Simpler setup but requires Trader Workstation to be running on your computer. 
            Best for personal use.
            <button 
              onClick={() => ibkrDocumentation.openTwsApiDocs()} 
              className="text-xs ml-2 text-blue-700 dark:text-blue-400 hover:underline focus:outline-none"
            >
              TWS API Docs
            </button>
          </li>
        </ul>
        <p className="text-sm italic">
          Note: The location of API settings in IBKR's account management interface may vary. If you cannot find it,
          <button 
            onClick={() => ibkrDocumentation.openApiSettingsHelp()} 
            className="text-xs ml-1 text-blue-700 dark:text-blue-400 hover:underline focus:outline-none"
          >
            view IBKR's support page
          </button> for assistance.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default IBKRApiKeyInfo;
