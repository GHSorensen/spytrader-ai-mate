
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from 'lucide-react';
import { StatisticalAnomaly } from '@/lib/types/spy/riskMonitoring';

interface AnomalyResultsProps {
  anomalies: StatisticalAnomaly[];
  anomalyLoading: boolean;
}

export const AnomalyResults: React.FC<AnomalyResultsProps> = ({
  anomalies,
  anomalyLoading
}) => {
  if (anomalyLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  
  return (
    <div className="rounded-md border bg-card">
      {anomalies.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">No anomalies detected</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            Run the detection to identify statistical anomalies in market data that could indicate trading opportunities.
          </p>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm font-medium mb-4">
            {anomalies.length} anomalies detected
          </p>
          {/* We'll use the full card component in the insights section instead */}
        </div>
      )}
    </div>
  );
};
