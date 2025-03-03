
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SpyHeader } from '@/components/spy/SpyHeader';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { useRiskMonitoring } from '@/hooks/useRiskMonitoring';
import { DEFAULT_SETTINGS } from '@/components/spy/settings/AISettingsTypes';
import { RiskInsights } from '@/components/spy/settings/risk/RiskInsights';
import { Shield, TrendingUp, ArrowLeftRight } from 'lucide-react';

const RiskConsole = () => {
  const [settings] = useState<AITradingSettings>(DEFAULT_SETTINGS);
  const [riskTolerance] = useState<RiskToleranceType>('moderate');

  // Use our risk monitoring hook
  const {
    isLoading,
    latestSignals,
    latestActions,
    learningInsights,
    autoMode,
    performRiskMonitoring,
    toggleAutoMode
  } = useRiskMonitoring(settings, riskTolerance);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4">
          <SpyHeader />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Risk Management Console</h2>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={toggleAutoMode}
            >
              <Shield className="h-4 w-4 mr-1" />
              {autoMode ? 'Auto Mode: ON' : 'Auto Mode: OFF'}
            </Button>

            <Button className="gap-1" onClick={performRiskMonitoring} disabled={isLoading}>
              <TrendingUp className="h-4 w-4 mr-1" />
              Run Risk Analysis
            </Button>
          </div>
        </div>
        
        {/* Risk Console */}
        <Tabs defaultValue="insights" className="mb-6">
          <TabsList>
            <TabsTrigger value="insights">Risk Insights</TabsTrigger>
            <TabsTrigger value="positions">Active Positions</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-4">
            <RiskInsights 
              signals={latestSignals}
              actions={latestActions}
              insights={learningInsights}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="positions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>Monitor your current risk exposure</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Position risk monitoring coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>Past analysis results and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Risk analysis history coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mb-6">
          <Button variant="outline" className="gap-1" asChild>
            <a href="/">
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              Return to Dashboard
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RiskConsole;
