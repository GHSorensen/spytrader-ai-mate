
import { useState, useEffect, useCallback } from 'react';
import anomalyDetectionService from '@/services/anomalyDetection/anomalyDetectionService';
import {
  AnomalyDetectionParams,
  StatisticalAnomaly,
  RiskSignal,
  AnomalyProcessorResult,
} from '@/lib/types/spy/riskMonitoring';
import { SpyMarketData, SpyOption, SpyTrade } from '@/lib/types/spy';
import { toast } from "sonner";
import { UseAnomalyDetectionProps, UseAnomalyDetectionReturn, AnomalyPerformanceRecord } from './types';
import { createInitialPerformanceRecord, updateHistoricalPerformance } from './utils';

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
  
  const [historicalPerformance, setHistoricalPerformance] = useState<AnomalyPerformanceRecord>(
    createInitialPerformanceRecord()
  );
  
  const runDetection = useCallback(async (
    currentMarketData: SpyMarketData,
    historicalMarketData: SpyMarketData[],
    currentOptions: SpyOption[] = [],
    historicalOptions: SpyOption[][] = []
  ): Promise<AnomalyProcessorResult> => {
    setIsLoading(true);
    
    try {
      const result = anomalyDetectionService.detectAnomalies(
        currentMarketData,
        historicalMarketData,
        currentOptions,
        historicalOptions,
        detectionParams
      );
      
      setAnomalies(result.anomalies);
      
      const signals = anomalyDetectionService.anomaliesToRiskSignals(result.anomalies);
      setRiskSignals(signals);
      
      setLastDetectionResult(result);
      setLastDetectionTime(new Date());
      
      if (showNotifications && result.triggerThresholdMet) {
        const highConfidenceAnomalies = result.anomalies.filter(a => a.confidence > 0.8);
        
        if (highConfidenceAnomalies.length > 0) {
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
  
  const clearAnomalies = useCallback(() => {
    setAnomalies([]);
    setRiskSignals([]);
    setLastDetectionResult(null);
  }, []);
  
  const updateDetectionParams = useCallback((newParams: Partial<AnomalyDetectionParams>) => {
    setDetectionParams(prev => ({
      ...prev,
      ...newParams
    }));
  }, []);
  
  const updatePerformanceWithTrades = useCallback((completedTrades: SpyTrade[]) => {
    if (anomalies.length === 0 || completedTrades.length === 0) {
      return;
    }
    
    const performance = updateHistoricalPerformance(completedTrades, anomalies);
    setHistoricalPerformance(performance);
  }, [anomalies]);
  
  const getAnomalyTradingSuggestions = useCallback((completedTrades?: SpyTrade[]) => {
    if (completedTrades && completedTrades.length > 0) {
      updatePerformanceWithTrades(completedTrades);
    }
    
    return anomalyDetectionService.getAnomalyTradingSuggestions(
      anomalies,
      historicalPerformance
    );
  }, [anomalies, historicalPerformance, updatePerformanceWithTrades]);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoDetect) {
      console.log('Auto-detection enabled but requires market data provider');
      
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
