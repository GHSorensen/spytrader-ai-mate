
import React from 'react';
import { LearningInsight } from '@/lib/types/spy/riskMonitoring';
import { formatPercentage, formatProfitImpact, getActionBadge, formatSignalPattern } from '../utils/insightFormatters';

interface InsightItemProps {
  insight: LearningInsight;
}

export const InsightItem: React.FC<InsightItemProps> = ({ insight }) => {
  return (
    <div className="p-3 border rounded-md bg-card mb-2 hover:bg-accent/5 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-sm">{formatSignalPattern(insight)}</div>
        <div className="text-xs text-muted-foreground">
          {new Date(insight.timestamp).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">Action:</span>
          {getActionBadge(insight.actionTaken)}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground mr-1">Success:</span>
            <span className={insight.successRate > 0.6 ? "text-green-500" : 
                   insight.successRate > 0.4 ? "text-amber-500" : "text-red-500"}>
              {formatPercentage(insight.successRate)}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground mr-1">Impact:</span>
            <span className={insight.profitImpact > 0 ? "text-green-500" : "text-red-500"}>
              {formatProfitImpact(insight.profitImpact)}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">{insight.description}</p>
      <div className="text-xs text-muted-foreground mt-1">
        Applied {insight.appliedCount} times with {insight.relatedRiskTolerance} risk tolerance
      </div>
    </div>
  );
};
