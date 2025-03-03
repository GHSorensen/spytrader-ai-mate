
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LightbulbIcon, TrendingDownIcon, TrendingUpIcon, AlertTriangleIcon } from 'lucide-react';
import { LearningInsight, RiskSignal, RiskAction } from '@/lib/types/spy/riskMonitoring';
import { SignalsSection } from './components/SignalsSection';
import { ActionsSection } from './components/ActionsSection';
import { RiskLearningInsightsCard } from './RiskLearningInsightsCard';

interface RiskInsightsProps {
  signals: RiskSignal[];
  actions: RiskAction[];
  insights: LearningInsight[];
  isLoading: boolean;
}

export const RiskInsights: React.FC<RiskInsightsProps> = ({
  signals,
  actions,
  insights,
  isLoading
}) => {
  // Get the most recent 5 signals and actions for display
  const recentSignals = [...signals].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);
  
  const recentActions = [...actions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-primary" />
            Risk Insights Dashboard
          </CardTitle>
          <CardDescription>
            Real-time analysis of market conditions and risk factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SignalsSection signals={recentSignals} isLoading={isLoading} />
            <ActionsSection actions={recentActions} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
      
      <RiskLearningInsightsCard 
        insights={insights}
        isLoading={isLoading}
      />
    </div>
  );
};
