
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const IBKRIntegrationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">IBKR Integration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Check your connection to Interactive Brokers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span>Disconnected</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              You are not currently connected to Interactive Brokers. Please configure your connection settings.
            </p>
            <Button>Connect</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Tools</CardTitle>
            <CardDescription>Troubleshoot connection issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              If you're having trouble connecting to Interactive Brokers, our diagnostic tools can help identify the issue.
            </p>
            <Link to="/ibkr/debug">
              <Button variant="outline">Open Diagnostics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Make sure you have an active Interactive Brokers account</li>
          <li>Install and log in to Trader Workstation (TWS)</li>
          <li>Configure API settings in TWS (Edit → Global Configuration → API → Settings)</li>
          <li>Enter your credentials in the connection form</li>
          <li>Click Connect to establish a connection</li>
        </ol>
      </div>
    </div>
  );
};

export default IBKRIntegrationPage;
