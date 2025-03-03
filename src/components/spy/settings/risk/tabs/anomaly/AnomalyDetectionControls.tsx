
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3 } from 'lucide-react';
import { toast } from "sonner";
import { StatisticalAnomaly } from '@/lib/types/spy/riskMonitoring';
import { generateMockCurrentData, generateMockHistoricalData } from './utils/mockDataGenerator';

interface AnomalyDetectionControlsProps {
  anomalyLoading: boolean;
  runDetection: (currentData: any, historicalData: any) => Promise<any>;
  anomalies: StatisticalAnomaly[];
}

export const AnomalyDetectionControls: React.FC<AnomalyDetectionControlsProps> = ({
  anomalyLoading,
  runDetection,
  anomalies
}) => {
  // Run anomaly detection with sample/mock data (for demo purposes)
  const runSampleAnomalyDetection = () => {
    // Get mock data using the utility functions
    const currentData = generateMockCurrentData();
    const historicalData = generateMockHistoricalData();
    
    // Run detection with this mock data
    runDetection(currentData, historicalData)
      .then(result => {
        if (result.anomalies.length === 0) {
          toast.info("No statistical anomalies detected in the sample data");
        } else {
          toast.success(`Detected ${result.anomalies.length} statistical anomalies`);
        }
      })
      .catch(error => {
        console.error("Error running anomaly detection:", error);
        toast.error("Failed to run anomaly detection");
      });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <span className="font-medium">Statistical Anomaly Detection</span>
      </div>
      <Button 
        onClick={runSampleAnomalyDetection} 
        disabled={anomalyLoading}
        variant="outline"
        size="sm"
      >
        Run Anomaly Detection
      </Button>
    </div>
  );
};
