
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Brain, BarChart3, ArrowRight, AlertTriangle } from 'lucide-react';
import { LearningInsight, RiskActionType } from '@/lib/types/spy/riskMonitoring';

interface RiskLearningInsightsCardProps {
  insights: LearningInsight[];
}

export const RiskLearningInsightsCard: React.FC<RiskLearningInsightsCardProps> = ({
  insights = []
}) => {
  // Helper function to format success rate as percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };
  
  // Helper function to format profit impact
  const formatProfitImpact = (value: number): string => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}$${value.toFixed(2)}`;
  };
  
  // Helper to get action badge with appropriate color
  const getActionBadge = (actionType: RiskActionType) => {
    const type = actionType.replace(/_/g, ' ');
    
    switch (actionType) {
      case 'exit_trade':
        return <Badge variant="destructive">{type}</Badge>;
      case 'reduce_position_size':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">{type}</Badge>;
      case 'hedge_position':
        return <Badge variant="outline">{type}</Badge>;
      case 'adjust_stop_loss':
      case 'adjust_take_profit':
        return <Badge variant="secondary">{type}</Badge>;
      case 'increase_position_size':
        return <Badge variant="outline" className="text-green-500 border-green-500">{type}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  // Helper to format signal pattern description
  const formatSignalPattern = (insight: LearningInsight): string => {
    const { source, condition, strength, direction } = insight.signalPattern;
    return `${direction} ${strength} ${source} signal during ${condition} market conditions`;
  };
  
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
          <div className="text-center py-6">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Not enough data to generate insights yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Insights will appear as the AI collects more data on risk management decisions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map(insight => (
              <div key={insight.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Pattern Detected</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatPercentage(insight.confidence)} confidence
                    </Badge>
                  </div>
                  <p className="text-xs mt-1">{formatSignalPattern(insight)}</p>
                </div>
                
                <div className="p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs mb-1">Success Rate</div>
                      <div className="font-medium">
                        {formatPercentage(insight.successRate)}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs mb-1">Avg. Profit Impact</div>
                      <div 
                        className={`font-medium ${
                          insight.averageProfitImpact >= 0 
                            ? 'text-positive' 
                            : 'text-negative'
                        }`}
                      >
                        {formatProfitImpact(insight.averageProfitImpact)}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs mb-1">Sample Size</div>
                      <div className="font-medium flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>{Math.round(insight.confidence * 20)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Recommended Actions</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {insight.recommendedActions.map((action, index) => (
                        <div key={index} className="flex items-center">
                          {index > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />}
                          {getActionBadge(action)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
