
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RiskInsights } from '@/components/spy/settings/risk/RiskInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RiskPatternsVisualization from '@/components/spy/risk/RiskPatternsVisualization';
import AnomalyPatternsCard from '@/components/spy/risk/AnomalyPatternsCard';
import { StatisticalAnomaly, RiskSignal, RiskAction, LearningInsight } from '@/lib/types/spy/riskMonitoring';

interface MainTabsProps {
  isLoading: boolean;
  latestSignals: RiskSignal[];
  latestActions: RiskAction[];
  learningInsights: LearningInsight[];
  anomalies: StatisticalAnomaly[];
  lastDetectionTime: Date | null;
  riskSignals: RiskSignal[];
}

export const MainTabs: React.FC<MainTabsProps> = ({
  isLoading,
  latestSignals,
  latestActions,
  learningInsights,
  anomalies,
  lastDetectionTime,
  riskSignals
}) => {
  return (
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
              isLoading={isLoading}
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
  );
};
