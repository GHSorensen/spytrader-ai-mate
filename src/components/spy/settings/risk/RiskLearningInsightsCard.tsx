
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain } from 'lucide-react';
import { LearningInsight } from '@/lib/types/spy/riskMonitoring';
import { InsightItem } from './components/InsightItem';
import { NoInsightsMessage } from './components/NoInsightsMessage';
import { 
  formatPercentage, 
  formatProfitImpact, 
  getActionBadge, 
  formatSignalPattern 
} from './utils/insightFormatters';

interface RiskLearningInsightsCardProps {
  insights: LearningInsight[];
}

export const RiskLearningInsightsCard: React.FC<RiskLearningInsightsCardProps> = ({
  insights = []
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Risk Management Insights
        </CardTitle>
        <CardDescription>
          Adaptive learning from past risk decisions and their outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <NoInsightsMessage />
        ) : (
          <div className="space-y-4">
            {insights.map(insight => (
              <InsightItem 
                key={insight.id}
                insight={insight}
                formatPercentage={formatPercentage}
                formatProfitImpact={formatProfitImpact}
                getActionBadge={getActionBadge}
                formatSignalPattern={formatSignalPattern}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
