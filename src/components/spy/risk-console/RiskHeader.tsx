
import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp } from 'lucide-react';

interface RiskHeaderProps {
  autoMode: boolean;
  isLoading: boolean;
  toggleAutoMode: () => void;
  performRiskMonitoring: () => void;
}

export const RiskHeader: React.FC<RiskHeaderProps> = ({
  autoMode,
  isLoading,
  toggleAutoMode,
  performRiskMonitoring
}) => {
  return (
    <>
      {/* Title and Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Risk Management Console</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={toggleAutoMode}
          >
            <Shield className="h-4 w-4 mr-1" />
            {autoMode ? 'Auto Mode: ON' : 'Auto Mode: OFF'}
          </Button>

          <Button className="gap-1" onClick={performRiskMonitoring} disabled={isLoading}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Run Risk Analysis
          </Button>
        </div>
      </div>
    </>
  );
};
