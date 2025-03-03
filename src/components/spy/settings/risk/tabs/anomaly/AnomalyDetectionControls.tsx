
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3 } from 'lucide-react';
import { toast } from "sonner";
import { StatisticalAnomaly } from '@/lib/types/spy/riskMonitoring';

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
    // Create mock market data for demonstration
    const currentData = {
      price: 415.50,
      previousClose: 412.25,
      change: 3.25,
      changePercent: 0.79,
      volume: 78500000,
      averageVolume: 72000000,
      high: 416.75,
      low: 413.20,
      open: 413.50,
      timestamp: new Date(),
      vix: 18.5
    };
    
    // Create 30 days of historical data
    const historicalData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      
      // Add some randomness to make it realistic
      const basePrice = 410 + Math.sin(i * 0.3) * 8;
      const randomFactor = Math.random() * 2 - 1;
      
      return {
        price: basePrice + randomFactor,
        previousClose: basePrice - 0.25,
        change: randomFactor + 0.25,
        changePercent: (randomFactor + 0.25) / basePrice * 100,
        volume: 70000000 + Math.random() * 10000000,
        averageVolume: 72000000,
        high: basePrice + 1 + randomFactor,
        low: basePrice - 1 + randomFactor,
        open: basePrice - 0.5 + randomFactor,
        timestamp: date,
        vix: 17 + Math.sin(i * 0.4) * 3
      };
    });
    
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
