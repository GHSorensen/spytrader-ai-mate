
import React, { useState } from 'react';
import { Terminal, ExternalLink, HelpCircle } from 'lucide-react';
import { ibkrDocumentation } from '@/services/dataProviders/interactiveBrokers/documentation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IBKRPrerequisites: React.FC = () => {
  const [apiMethod, setApiMethod] = useState<'webapi' | 'tws'>('webapi');

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h3 className="font-medium mb-2 flex items-center">
        <Terminal className="h-4 w-4 mr-2" />
        IBKR Connection Options
      </h3>
      
      <Tabs defaultValue={apiMethod} onValueChange={(value) => setApiMethod(value as 'webapi' | 'tws')}>
        <TabsList className="mb-4">
          <TabsTrigger value="webapi">Client Portal API (Web)</TabsTrigger>
          <TabsTrigger value="tws">TWS API (Desktop)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="webapi">
          <div className="space-y-3">
            <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded flex items-start">
              <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                Finding the API settings in IBKR can be challenging. Look under "Users & Access Rights" and then 
                "Access Rights" sections. You may need to contact IBKR support if you can't find these settings.
              </span>
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>You need an active Interactive Brokers account (IBKR Pro)</li>
              <li>You'll need to create API credentials in the IBKR dashboard</li>
              <li>OAuth credentials must be registered in your IBKR account</li>
              <li>Your Client Portal API gateway must be active when trading</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="tws">
          <div className="space-y-3">
            <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded flex items-start">
              <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>
                TWS API is generally easier to set up than Web API, but requires TWS (Trader Workstation) 
                to be running on your computer when you want to trade.
              </span>
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Download and install IBKR Trader Workstation (TWS)</li>
              <li>In TWS, go to Edit → Global Configuration → API → Settings</li>
              <li>Enable API connections and set a port number (default is 7496)</li>
              <li>TWS must be running on your computer when trading</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-sm flex flex-col space-y-2">
        <a 
          href="https://www.interactivebrokers.com/en/index.php?f=4985" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-primary hover:underline"
        >
          <span>IBKR API Documentation Portal</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
        <a 
          href="https://interactivebrokers.github.io/tws-api/" 
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center text-primary hover:underline"
        >
          <span>TWS API Documentation</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
        <a 
          href="https://interactivebrokers.github.io/cpwebapi/" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-primary hover:underline"
        >
          <span>Client Portal API Documentation</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default IBKRPrerequisites;
