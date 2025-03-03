
import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingDownIcon, TrendingUpIcon, AlertTriangleIcon } from 'lucide-react';
import { 
  LearningInsight, 
  RiskSignal, 
  RiskAction,
  StatisticalAnomaly 
} from '@/lib/types/spy/riskMonitoring';
import { RiskInsightsHeader } from './components/RiskInsightsHeader';
import { RiskInsightsContent } from './components/RiskInsightsContent';
import { RiskLearningInsightsCard } from './RiskLearningInsightsCard';
import { AnomalyDetectionCard } from './AnomalyDetectionCard';

interface RiskInsightsProps {
  signals: RiskSignal[];
  actions: RiskAction[];
  insights: LearningInsight[];
  anomalies?: StatisticalAnomaly[];
  lastAnomalyDetectionTime?: Date | null;
  isLoading: boolean;
}

export const RiskInsights: React.FC<RiskInsightsProps> = ({
  signals,
  actions,
  insights,
  anomalies = [],
  lastAnomalyDetectionTime = null,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <RiskInsightsHeader 
          title="Risk Insights Dashboard"
          description="Real-time analysis of market conditions and risk factors"
          icon={<LightbulbIcon className="h-5 w-5 text-primary" />}
        />
        <RiskInsightsContent 
          signals={signals}
          actions={actions}
          isLoading={isLoading}
        />
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnomalyDetectionCard 
          anomalies={anomalies}
          isLoading={isLoading}
          lastDetectionTime={lastAnomalyDetectionTime}
        />
        
        <RiskLearningInsightsCard 
          insights={insights}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
