import React, { useState } from 'react';
import { RiskHeader } from '../components/spy/risk-console/RiskHeader';
import { MainTabs } from '../components/spy/risk-console/MainTabs';
import { Footer } from '../components/spy/risk-console/Footer';
import { DemoNotifications } from '../components/spy/risk-console/DemoNotifications';
import { useRiskMonitoring } from '../hooks/useRiskMonitoring';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';

const RiskConsole: React.FC = () => {
  const [autoMode, setAutoMode] = useState(false);
  
  const defaultSettings: AITradingSettings = {
    riskManagement: {
      stopLossPercentage: 15,
      takeProfitPercentage: 30,
      maxPositionSize: 10,
      maxDrawdown: 25
    }
  };
  
  const currentRiskTolerance: RiskToleranceType = 'moderate';
  
  const { 
    performRiskMonitoring, 
    isLoading,
    latestSignals,
    latestActions,
    learningInsights,
    currentRiskProfile,
    activeTrades,
    toggleAutoMode 
  } = useRiskMonitoring(defaultSettings, currentRiskTolerance);
  
  const anomalies = [];
  const lastDetectionTime = new Date();
  const riskSignals = [];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <RiskHeader
          autoMode={autoMode}
          isLoading={isLoading}
          toggleAutoMode={toggleAutoMode}
          performRiskMonitoring={performRiskMonitoring}
        />
        
        <MainTabs 
          isLoading={isLoading}
          latestSignals={latestSignals || []}
          latestActions={latestActions || []}
          learningInsights={learningInsights || []}
          anomalies={anomalies}
          lastDetectionTime={lastDetectionTime}
          riskSignals={riskSignals}
        />
        
        <Footer />
        
        <DemoNotifications />
      </div>
    </div>
  );
};

export default RiskConsole;
