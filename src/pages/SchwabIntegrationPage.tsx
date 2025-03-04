
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle } from 'lucide-react';

const SchwabIntegrationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Brokerage Integration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Schwab Integration</CardTitle>
            <CardDescription>
              Connect your Schwab account to enable automated trading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Integration with Schwab API allows for direct trading and account management through SPY Trading AI.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="flex items-center">
              Set Up Schwab
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Interactive Brokers TWS</CardTitle>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recommended</div>
            </div>
            <CardDescription>
              Connect to IBKR Trader Workstation for reliable trading execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The Interactive Brokers Trader Workstation (TWS) connection provides the most reliable and feature-rich trading experience.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Link to="/ibkr-integration">
              <Button className="flex items-center bg-primary">
                Connect to IBKR
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start">
          <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-700 dark:text-blue-300">Which integration should I choose?</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              For most users, we recommend the Interactive Brokers TWS integration for its reliability and comprehensive features. 
              IBKR TWS provides better execution speeds and more detailed market data compared to other integrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchwabIntegrationPage;
