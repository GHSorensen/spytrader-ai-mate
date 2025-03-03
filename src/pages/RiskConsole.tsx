
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { useRiskMonitoring } from '@/hooks/useRiskMonitoring';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { DEFAULT_SETTINGS } from '@/components/spy/settings/AISettingsTypes';
import { RiskInsights } from '@/components/spy/settings/risk/RiskInsights';
import { Shield, TrendingUp, ArrowLeftRight } from 'lucide-react';
import RiskPatternsVisualization from '@/components/spy/risk/RiskPatternsVisualization';
import AnomalyPatternsCard from '@/components/spy/risk/AnomalyPatternsCard';
import notificationService from '@/services/notification/notificationService';

const RiskConsole = () => {
  const [settings] = useState<AITradingSettings>(DEFAULT_SETTINGS);
  const [riskTolerance] = useState<RiskToleranceType>('moderate');

  // Use our risk monitoring hook
  const {
    isLoading: riskLoading,
    latestSignals,
    latestActions,
    learningInsights,
    autoMode,
    performRiskMonitoring,
    toggleAutoMode
  } = useRiskMonitoring(settings, riskTolerance);
  
  // Use our anomaly detection hook
  const {
    isLoading: anomalyLoading,
    anomalies,
    riskSignals,
    lastDetectionTime,
    runDetection
  } = useAnomalyDetection({
    showNotifications: true,
    params: {
      sensitivity: 0.7,
      timeWindow: '1h'
    }
  });
  
  // Combined loading state
  const isLoading = riskLoading || anomalyLoading;
  
  // Demo function to create some sample notifications when the page loads
  useEffect(() => {
    // Portfolio balance notification
    notificationService.notifyPortfolioBalance(
      'morning',
      125000,
      1200,
      0.97
    );
    
    // Schedule end of day update (for demo purposes we'll show it immediately)
    setTimeout(() => {
      notificationService.notifyPortfolioBalance(
        'end_of_day',
        126500,
        2700,
        2.18
      );
    }, 5000);
    
    // Demo risk alert (after 10 seconds)
    setTimeout(() => {
      notificationService.notifyRiskAlert(
        'high',
        'Unusual volatility detected in the market. Consider adjusting position sizes.',
        { volatilityIndex: 32.5, normalRange: "15-25" }
      );
    }, 10000);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4">
          <SpyHeaderWithNotifications />
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
            <TabsTrigger value="patterns">Risk Patterns</TabsTrigger>
            <TabsTrigger value="positions">Active Positions</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-4">
            <RiskInsights 
              signals={latestSignals}
              actions={latestActions}
              insights={learningInsights}
              anomalies={anomalies}
              lastAnomalyDetectionTime={lastDetectionTime}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="patterns" className="mt-4">
            <div className="space-y-6">
              <RiskPatternsVisualization 
                anomalies={anomalies}
                signals={[...latestSignals, ...riskSignals]}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnomalyPatternsCard 
                  anomalies={anomalies}
                  lastDetectionTime={lastDetectionTime}
                  isLoading={anomalyLoading}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Action Effectiveness</CardTitle>
                    <CardDescription>
                      Evaluating the effectiveness of automated risk management actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Risk action effectiveness visualization coming soon
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
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
