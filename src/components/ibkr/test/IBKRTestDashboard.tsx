
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import IBKRConnectionTests from './IBKRConnectionTests';
import IBKRRealTimeDataTestView from '../test/IBKRRealTimeDataTestView';

/**
 * Comprehensive dashboard for IBKR testing and diagnostics
 */
const IBKRTestDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">IBKR Test Dashboard</h1>
        <p className="text-muted-foreground">
          Test, monitor, and troubleshoot Interactive Brokers connectivity
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="connection">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="connection">Connection Tests</TabsTrigger>
          <TabsTrigger value="data">Real-Time Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="mt-4">
          <IBKRConnectionTests />
        </TabsContent>
        
        <TabsContent value="data" className="mt-4">
          <IBKRRealTimeDataTestView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IBKRTestDashboard;
