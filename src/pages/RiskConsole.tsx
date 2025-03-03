
import React, { useState } from 'react';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { useRiskMonitoring } from '@/hooks/useRiskMonitoring';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { DEFAULT_SETTINGS } from '@/components/spy/settings/AISettingsTypes';
import { RiskHeader } from '@/components/spy/risk-console/RiskHeader';
import { MainTabs } from '@/components/spy/risk-console/MainTabs';
import { Footer } from '@/components/spy/risk-console/Footer';
import { DemoNotifications } from '@/components/spy/risk-console/DemoNotifications';

const RiskConsole = () => {
  const [settings] = useState<AITradingSettings>(DEFAULT_SETTINGS);
  const [riskTolerance] = useState<RiskToleranceType>('moderate');

  // Use our risk monitoring hook
  const {
    isLoading: riskLoading,
    latestSignals,
    latestActions,
    learningInsights,
    autoMode,
    performRiskMonitoring,
    toggleAutoMode
  } = useRiskMonitoring(settings, riskTolerance);
  
  // Use our anomaly detection hook
  const {
    isLoading: anomalyLoading,
    anomalies,
    riskSignals,
    lastDetectionTime,
    runDetection
  } = useAnomalyDetection({
    showNotifications: true,
    params: {
      sensitivity: 0.7,
      timeWindow: '1h'
    }
  });
  
  // Combined loading state
  const isLoading = riskLoading || anomalyLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Demo notifications (invisible component) */}
      <DemoNotifications />
      
      {/* Header with navigation and action buttons */}
      <RiskHeader 
        autoMode={autoMode}
        isLoading={isLoading} 
        toggleAutoMode={toggleAutoMode}
        performRiskMonitoring={performRiskMonitoring}
      />
      
      {/* Main Content */}
      <main className="container py-6">
        {/* Main Tabs for different views */}
        <MainTabs 
          isLoading={isLoading}
          latestSignals={latestSignals}
          latestActions={latestActions}
          learningInsights={learningInsights}
          anomalies={anomalies}
          lastDetectionTime={lastDetectionTime}
          riskSignals={riskSignals}
        />
        
        {/* Footer with navigation links */}
        <Footer />
      </main>
    </div>
  );
};

export default RiskConsole;
