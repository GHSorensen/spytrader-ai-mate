
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IBKRConnectionDebugger from '@/components/ibkr/IBKRConnectionDebugger';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IBKRDebugPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/ibkr');
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">IBKR Connection Diagnostics</h1>
          <p className="text-gray-500">Advanced connection and authentication troubleshooting</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About SoFi API</CardTitle>
            <CardDescription>Information about SoFi trading API integration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Currently, SoFi does not offer a public trading API for retail investors or third-party applications. 
              Unlike Interactive Brokers or TD Ameritrade, SoFi has not released developer documentation or API credentials 
              for building trading applications.
            </p>
            <p className="mb-4">
              While SoFi is a popular retail brokerage, they currently focus on their own platform rather than 
              offering API access. If you're looking for a brokerage with strong API capabilities, Interactive Brokers (IBKR), 
              TD Ameritrade, and Alpaca offer well-documented APIs with sandbox environments for testing.
            </p>
            <p>
              For your current implementation, we recommend continuing with the IBKR integration and resolving 
              the authentication issues shown in the diagnostic tool below.
            </p>
          </CardContent>
        </Card>
      
        <IBKRConnectionDebugger />
        
        <Card>
          <CardHeader>
            <CardTitle>TWS Connection Guide</CardTitle>
            <CardDescription>Steps to ensure TWS is properly configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">1. TWS Setup</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Ensure TWS (Trader Workstation) is installed and running</li>
                <li>Log in to TWS with your IBKR credentials</li>
                <li>TWS should be open while you try to connect from this application</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">2. API Configuration</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>In TWS, go to Edit → Global Configuration → API → Settings</li>
                <li>Check "Enable ActiveX and Socket Clients"</li>
                <li>Enable "Allow connections from localhost"</li>
                <li>Uncheck "Read-Only API" if you want to place trades</li>
                <li>Set Socket Port to 7496 for live trading or 7497 for paper trading</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">3. Correct Port Settings</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Paper Trading Account: Use port 7497</li>
                <li>Live Trading Account: Use port 7496</li>
                <li>Make sure the port in your configuration matches the type of account</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-blue-700">
                <li>TWS must remain open while using this application</li>
                <li>API connection may require approval on the first connection attempt</li>
                <li>Check the "Trusted Applications" tab in TWS API settings if connections fail</li>
                <li>Use the "Reset API Settings" button in TWS if problems persist</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IBKRDebugPage;
