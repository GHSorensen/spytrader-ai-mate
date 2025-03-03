
import { useState, useEffect, useCallback } from 'react';
import anomalyDetectionService from '@/services/anomalyDetection/anomalyDetectionService';
import {
  AnomalyDetectionParams,
  StatisticalAnomaly,
  RiskSignal,
  AnomalyProcessorResult,
  AnomalyType,
  RiskSignalDirection
} from '@/lib/types/spy/riskMonitoring';
import { SpyMarketData, SpyOption, SpyTrade } from '@/lib/types/spy';
import { toast } from "sonner";

interface UseAnomalyDetectionProps {
  autoDetect?: boolean;
  detectionInterval?: number; // in milliseconds, default 60000 (1 minute)
  showNotifications?: boolean;
  params?: Partial<AnomalyDetectionParams>;
}

interface UseAnomalyDetectionReturn {
  isLoading: boolean;
  anomalies: StatisticalAnomaly[];
  riskSignals: RiskSignal[];
  lastDetectionResult: AnomalyProcessorResult | null;
  lastDetectionTime: Date | null;
  runDetection: (
    currentMarketData: SpyMarketData,
    historicalMarketData: SpyMarketData[],
    currentOptions?: SpyOption[],
    historicalOptions?: SpyOption[][]
  ) => Promise<AnomalyProcessorResult>;
  clearAnomalies: () => void;
  setDetectionParams: (params: Partial<AnomalyDetectionParams>) => void;
  getAnomalyTradingSuggestions: (
    completedTrades?: SpyTrade[]
  ) => Array<{
    anomalyId: string;
    anomalyType: AnomalyType;
    confidence: number;
    recommendation: string;
    optionType?: 'CALL' | 'PUT';
    expectedSuccessRate?: number;
    historicalAvgProfit?: number;
    priority: number;
  }>;
  detectionParams: AnomalyDetectionParams;
}

export function useAnomalyDetection({
  autoDetect = false,
  detectionInterval = 60000,
  showNotifications = true,
  params = {}
}: UseAnomalyDetectionProps = {}): UseAnomalyDetectionReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anomalies, setAnomalies] = useState<StatisticalAnomaly[]>([]);
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>([]);
  const [lastDetectionResult, setLastDetectionResult] = useState<AnomalyProcessorResult | null>(null);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);
  const [detectionParams, setDetectionParams] = useState<AnomalyDetectionParams>({
    ...anomalyDetectionService.DEFAULT_DETECTION_PARAMS,
    ...params
  });
  
  // Store historical performance data for suggestions
  const [historicalPerformance, setHistoricalPerformance] = useState<Record<AnomalyType, {
    successRate: number;
    avgProfit: number;
    tradeCount: number;
    bestDirection: 'CALL' | 'PUT' | null;
  }>>({});
  
  // Detection function
  const runDetection = useCallback(async (
    currentMarketData: SpyMarketData,
    historicalMarketData: SpyMarketData[],
    currentOptions: SpyOption[] = [],
    historicalOptions: SpyOption[][] = []
  ): Promise<AnomalyProcessorResult> => {
    setIsLoading(true);
    
    try {
      // Run anomaly detection
      const result = anomalyDetectionService.detectAnomalies(
        currentMarketData,
        historicalMarketData,
        currentOptions,
        historicalOptions,
        detectionParams
      );
      
      setAnomalies(result.anomalies);
      
      // Convert anomalies to risk signals
      const signals = anomalyDetectionService.anomaliesToRiskSignals(result.anomalies);
      setRiskSignals(signals);
      
      // Update state
      setLastDetectionResult(result);
      setLastDetectionTime(new Date());
      
      // Show notifications for significant anomalies if enabled
      if (showNotifications && result.triggerThresholdMet) {
        const highConfidenceAnomalies = result.anomalies.filter(a => a.confidence > 0.8);
        
        if (highConfidenceAnomalies.length > 0) {
          // Get the highest confidence anomaly
          const topAnomaly = highConfidenceAnomalies.sort((a, b) => b.confidence - a.confidence)[0];
          
          toast.warning(
            `Statistical Anomaly Detected: ${topAnomaly.description}`,
            {
              description: `Confidence: ${(topAnomaly.confidence * 100).toFixed(0)}% | Type: ${topAnomaly.type}`,
              duration: 6000,
            }
          );
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      toast.error('Anomaly detection failed');
      return {
        anomalies: [],
        processedDataPoints: 0,
        detectionTimestamp: new Date(),
        executionTimeMs: 0,
        triggerThresholdMet: false
      };
    } finally {
      setIsLoading(false);
    }
  }, [detectionParams, showNotifications]);
  
  // Clear results
  const clearAnomalies = useCallback(() => {
    setAnomalies([]);
    setRiskSignals([]);
    setLastDetectionResult(null);
  }, []);
  
  // Update detection parameters
  const updateDetectionParams = useCallback((newParams: Partial<AnomalyDetectionParams>) => {
    setDetectionParams(prev => ({
      ...prev,
      ...newParams
    }));
  }, []);
  
  // Analyze historical trade performance with anomalies
  const updateHistoricalPerformance = useCallback((completedTrades: SpyTrade[]) => {
    if (anomalies.length === 0 || completedTrades.length === 0) {
      return;
    }
    
    const performance = anomalyDetectionService.analyzeAnomalyTradePerformance(
      completedTrades,
      anomalies
    );
    
    setHistoricalPerformance(performance);
  }, [anomalies]);
  
  // Get trading suggestions based on detected anomalies
  const getAnomalyTradingSuggestions = useCallback((completedTrades?: SpyTrade[]) => {
    if (completedTrades && completedTrades.length > 0) {
      updateHistoricalPerformance(completedTrades);
    }
    
    return anomalyDetectionService.getAnomalyTradingSuggestions(
      anomalies,
      historicalPerformance
    );
  }, [anomalies, historicalPerformance, updateHistoricalPerformance]);
  
  // Set up auto-detection if enabled
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoDetect) {
      // This is just a placeholder - in a real app, you would have 
      // a data provider that automatically fetches market data
      console.log('Auto-detection enabled but requires market data provider');
      
      // Uncomment this when you have a data provider:
      /*
      intervalId = setInterval(async () => {
        const currentData = await dataProvider.getMarketData();
        const historicalData = await dataProvider.getHistoricalMarketData();
        const options = await dataProvider.getOptions();
        
        runDetection(currentData, historicalData, options);
      }, detectionInterval);
      */
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoDetect, detectionInterval, runDetection]);
  
  return {
    isLoading,
    anomalies,
    riskSignals,
    lastDetectionResult,
    lastDetectionTime,
    runDetection,
    clearAnomalies,
    setDetectionParams: updateDetectionParams,
    getAnomalyTradingSuggestions,
    detectionParams
  };
}

export default useAnomalyDetection;
