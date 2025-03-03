
import { AnomalyType } from '@/lib/types/spy/riskMonitoring';
import { SpyTrade } from '@/lib/types/spy';
import { AnomalyPerformanceRecord } from './types';
import anomalyDetectionService from '@/services/anomalyDetection/anomalyDetectionService';

export function createInitialPerformanceRecord(): AnomalyPerformanceRecord {
  const anomalyTypes: AnomalyType[] = [
    'price_spike', 
    'volume_surge', 
    'volatility_explosion', 
    'correlation_break', 
    'pattern_deviation', 
    'momentum_shift', 
    'liquidity_change',
    'option_skew_change',
    'implied_volatility_divergence'
  ];
  
  const initialPerformance: AnomalyPerformanceRecord = {} as AnomalyPerformanceRecord;
  
  anomalyTypes.forEach(type => {
    initialPerformance[type] = {
      successRate: 0,
      avgProfit: 0,
      tradeCount: 0,
      bestDirection: null
    };
  });
  
  return initialPerformance;
}

export function updateHistoricalPerformance(
  completedTrades: SpyTrade[],
  anomalies: any[]
): AnomalyPerformanceRecord {
  if (anomalies.length === 0 || completedTrades.length === 0) {
    return createInitialPerformanceRecord();
  }
  
  return anomalyDetectionService.analyzeAnomalyTradePerformance(
    completedTrades,
    anomalies
  );
}
