
import { StatisticalAnomaly, RiskSignal } from '@/lib/types/spy/riskMonitoring';

export interface RiskPatternsVisualizationProps {
  anomalies: StatisticalAnomaly[];
  signals: RiskSignal[];
  timeFrame?: TimeFrameOption;
}

export type TimeFrameOption = '7d' | '30d' | '90d' | 'all';
