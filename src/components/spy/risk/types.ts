
import { StatisticalAnomaly, RiskSignal } from '@/lib/types/spy/riskMonitoring';

export interface RiskPatternsVisualizationProps {
  anomalies: StatisticalAnomaly[];
  signals: RiskSignal[];
  timeFrame?: '7d' | '30d' | '90d' | 'all';
}

export type TimeFrameOption = '7d' | '30d' | '90d' | 'all';
