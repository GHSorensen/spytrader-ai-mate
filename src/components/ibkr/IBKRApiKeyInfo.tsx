
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const IBKRApiKeyInfo: React.FC = () => {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-700 dark:text-blue-400" />
      <AlertTitle className="text-blue-700 dark:text-blue-400">Important: Authentication Method</AlertTitle>
      <AlertDescription className="text-blue-600 dark:text-blue-300">
        This integration uses OAuth with IBKR's Client Portal API. You do NOT enter your IBKR username and password here.
        Instead, you'll need to create a Client ID in your IBKR account settings first.
      </AlertDescription>
    </Alert>
  );
};

export default IBKRApiKeyInfo;
