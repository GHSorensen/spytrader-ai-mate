
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"; 
import { RiskHeader } from '../components/spy/risk-console/RiskHeader';
import { MainTabs } from '../components/spy/risk-console/MainTabs';
import { Footer } from '../components/spy/risk-console/Footer';
import { DemoNotifications } from '../components/spy/risk-console/DemoNotifications';
import { useRiskMonitoring } from '../hooks/useRiskMonitoring';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { RiskSignal, StatisticalAnomaly } from '@/lib/types/spy/riskMonitoring';

const RiskConsole: React.FC = () => {
  const navigate = useNavigate();
  
  // Updated to match the AITradingSettings type structure
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
    autoMode,
    toggleAutoMode 
  } = useRiskMonitoring(defaultSettings, currentRiskTolerance);
  
  // Generate some mock signals for demonstration
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>([]);
  const [anomalies, setAnomalies] = useState<StatisticalAnomaly[]>([]);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date>(new Date());
  
  // Initialize with sample data
  useEffect(() => {
    if (!latestSignals?.length) {
      // This will ensure we at least have some data to display
      const mockSignals: RiskSignal[] = [
        {
          id: 'signal-1',
          timestamp: new Date(),
          source: 'volatility',
          condition: 'volatile',
          strength: 'strong',
          direction: 'bearish',
          description: 'VIX spike detected above normal thresholds',
          confidence: 0.85
        },
        {
          id: 'signal-2',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          source: 'price',
          condition: 'trending',
          strength: 'moderate',
          direction: 'bearish',
          description: 'SPY price falling below 50-day moving average',
          confidence: 0.72
        }
      ];
      setRiskSignals(mockSignals);
    } else {
      setRiskSignals(latestSignals);
    }
    
    // Mock anomalies
    const mockAnomalies: StatisticalAnomaly[] = [
      {
        id: 'anomaly-1',
        timestamp: new Date(),
        type: 'volatility_explosion',
        detectionMethod: 'zscore',
        timeWindow: '1d',
        metric: 'VIX',
        value: 35.2,
        expectedValue: 18.5,
        deviation: 2.8,
        zScore: 3.2,
        confidence: 0.92,
        description: 'Abnormal volatility expansion detected'
      }
    ];
    setAnomalies(mockAnomalies);
  }, [latestSignals]);
  
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };
  
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
        
        <div className="mt-auto">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1" 
              onClick={handleReturnToDashboard}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Return to Dashboard
            </Button>
          </div>
          
          <Footer />
        </div>
        
        <DemoNotifications />
      </div>
    </div>
  );
};

export default RiskConsole;
