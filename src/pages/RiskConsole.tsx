
import React, { useState } from 'react';
import { RiskHeader } from '../components/spy/risk-console/RiskHeader';
import { MainTabs } from '../components/spy/risk-console/MainTabs';
import { Footer } from '../components/spy/risk-console/Footer';
import { DemoNotifications } from '../components/spy/risk-console/DemoNotifications';
import { useRiskMonitoring } from '../hooks/useRiskMonitoring';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';

const RiskConsole: React.FC = () => {
  const [autoMode, setAutoMode] = useState(false);
  
  // Updated to match the AITradingSettings type structure 
  // from src/components/spy/settings/AISettingsTypes.ts
  const defaultSettings: AITradingSettings = {
    enabledStrategies: ['moderate'],
    maxSimultaneousTrades: 3,
    maxDailyTrades: 5,
    autoAdjustVolatility: true,
    useMarketSentiment: true,
    considerEarningsEvents: true,
    considerFedMeetings: true,
    enableHedging: false,
    minimumConfidenceScore: 0.65,
    preferredTimeOfDay: 'any',
    adaptivePositionSizing: false,
    advancedTechnicalAnalysis: true,
    technicalFundamentalBalance: 60,
    shortLongTimeframeBalance: 50,
    maxCapitalDeployment: 70,
    autoPositionScaling: false,
    smartProfitTaking: true,
    considerEconomicData: true,
    considerGeopoliticalEvents: false,
    dailyLossLimitPct: 2,
    volatilityThreshold: 25,
    positionSizing: {
      type: 'percentage',
      value: 5,
    },
    stopLossSettings: {
      enabled: true,
      type: 'percentage',
      value: 25,
    },
    takeProfitSettings: {
      enabled: true,
      type: 'risk-reward',
      value: 2,
    },
    marketConditionOverrides: {
      volatile: {
        enabled: true,
        adjustedRisk: 0.5,
      }
    },
    backtestingSettings: {
      startDate: new Date(new Date().getFullYear() - 10, 0, 1),
      endDate: new Date(),
      initialCapital: 100000,
      dataSource: 'alpha-vantage',
      includeCommissions: true,
      commissionPerTrade: 0.65,
      includeTaxes: false,
      taxRate: 0.25,
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
