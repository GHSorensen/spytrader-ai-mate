
import React from 'react';
import { AnomalyDetectionControls } from './AnomalyDetectionControls';
import { AnomalyExplanation } from './AnomalyExplanation';
import { AnomalyResults } from './AnomalyResults';
import { StatisticalAnomaly } from '@/lib/types/spy/riskMonitoring';

interface AnomalyDetectionTabContentProps {
  anomalyLoading: boolean;
  anomalies: StatisticalAnomaly[];
  runDetection: (currentData: any, historicalData: any) => Promise<any>;
}

export const AnomalyDetectionTabContent: React.FC<AnomalyDetectionTabContentProps> = ({
  anomalyLoading,
  anomalies,
  runDetection
}) => {
  return (
    <div className="space-y-4 pt-2">
      <AnomalyDetectionControls
        anomalyLoading={anomalyLoading}
        runDetection={runDetection}
        anomalies={anomalies}
      />
      
      <AnomalyExplanation />
      
      <AnomalyResults 
        anomalies={anomalies} 
        anomalyLoading={anomalyLoading} 
      />
    </div>
  );
};
