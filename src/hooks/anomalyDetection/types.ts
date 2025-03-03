
import {
  AnomalyDetectionParams,
  StatisticalAnomaly,
  RiskSignal,
  AnomalyProcessorResult,
  AnomalyType,
  RiskSignalDirection
} from '@/lib/types/spy/riskMonitoring';
import { SpyMarketData, SpyOption, SpyTrade } from '@/lib/types/spy';

export interface UseAnomalyDetectionProps {
  autoDetect?: boolean;
  detectionInterval?: number; // in milliseconds, default 60000 (1 minute)
  showNotifications?: boolean;
  params?: Partial<AnomalyDetectionParams>;
}

export interface UseAnomalyDetectionReturn {
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

export interface AnomalyPerformanceData {
  successRate: number;
  avgProfit: number;
  tradeCount: number;
  bestDirection: 'CALL' | 'PUT' | null;
}

export type AnomalyPerformanceRecord = Record<AnomalyType, AnomalyPerformanceData>;
