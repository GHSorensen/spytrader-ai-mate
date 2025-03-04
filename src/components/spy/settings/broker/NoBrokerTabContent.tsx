
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NoBrokerTabContent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Broker Integration</CardTitle>
        <CardDescription>
          Run the system without connecting to a real brokerage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            You're currently using the application without a broker connection. 
            This mode provides:
          </p>
          <ul className="ml-6 list-disc space-y-2">
            <li>Full access to the SPY trading AI analysis</li>
            <li>Mock market data for testing and learning</li>
            <li>Paper trading capabilities without real money at risk</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            To enable live trading or get real-time market data, connect to a supported broker
            using one of the other tabs.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" disabled>
          Continue Without Broker
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoBrokerTabContent;
