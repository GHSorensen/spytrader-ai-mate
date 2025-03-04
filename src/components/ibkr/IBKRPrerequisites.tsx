
import React from 'react';
import { Terminal, ExternalLink } from 'lucide-react';
import { ibkrDocumentation } from '@/services/dataProviders/interactiveBrokers/documentation';

const IBKRPrerequisites: React.FC = () => {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h3 className="font-medium mb-2 flex items-center">
        <Terminal className="h-4 w-4 mr-2" />
        Prerequisites
      </h3>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>You need an active Interactive Brokers account (IBKR Pro)</li>
        <li>Trader Workstation (TWS) or IB Gateway must be running</li>
        <li>Client Portal API must be enabled in your account settings</li>
        <li>You need to have created API credentials in the IBKR dashboard</li>
      </ul>
      <div className="mt-4 text-sm flex flex-col space-y-2">
        <a 
          href="#" 
          onClick={(e) => {e.preventDefault(); ibkrDocumentation.openAPISettings();}}
          className="flex items-center text-primary hover:underline"
        >
          <span>Go to IBKR API Settings to Create Client ID</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
        <a 
          href="#" 
          onClick={(e) => {e.preventDefault(); ibkrDocumentation.openClientIDHelp();}}
          className="flex items-center text-primary hover:underline"
        >
          <span>How to Create a Client ID (Documentation)</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
        <a 
          href="#" 
          onClick={(e) => {e.preventDefault(); ibkrDocumentation.openUserGuide();}}
          className="flex items-center text-primary hover:underline"
        >
          <span>IBKR Web API Documentation</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default IBKRPrerequisites;
