
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Brain, BarChart3, ArrowRight } from 'lucide-react';
import { LearningInsight, RiskActionType } from '@/lib/types/spy/riskMonitoring';

interface InsightItemProps {
  insight: LearningInsight;
  formatPercentage: (value: number) => string;
  formatProfitImpact: (value: number) => string;
  getActionBadge: (actionType: RiskActionType) => JSX.Element;
  formatSignalPattern: (insight: LearningInsight) => string;
}

export const InsightItem: React.FC<InsightItemProps> = ({
  insight,
  formatPercentage,
  formatProfitImpact,
  getActionBadge,
  formatSignalPattern
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
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
        <InsightMetrics 
          insight={insight} 
          formatPercentage={formatPercentage} 
          formatProfitImpact={formatProfitImpact} 
        />
        
        <RecommendedActions 
          actions={insight.recommendedActions} 
          getActionBadge={getActionBadge} 
        />
      </div>
    </div>
  );
};

interface InsightMetricsProps {
  insight: LearningInsight;
  formatPercentage: (value: number) => string;
  formatProfitImpact: (value: number) => string;
}

const InsightMetrics: React.FC<InsightMetricsProps> = ({
  insight,
  formatPercentage,
  formatProfitImpact
}) => {
  return (
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
  );
};

interface RecommendedActionsProps {
  actions: RiskActionType[];
  getActionBadge: (actionType: RiskActionType) => JSX.Element;
}

const RecommendedActions: React.FC<RecommendedActionsProps> = ({ actions, getActionBadge }) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">Recommended Actions</p>
      <div className="flex gap-1.5 flex-wrap">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />}
            {getActionBadge(action)}
          </div>
        ))}
      </div>
    </div>
  );
};
