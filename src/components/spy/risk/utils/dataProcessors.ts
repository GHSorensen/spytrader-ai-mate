
import { StatisticalAnomaly, RiskSignal, AnomalyType } from '@/lib/types/spy/riskMonitoring';
import { format, subDays } from 'date-fns';

/**
 * Filters data based on the selected time frame
 */
export const getFilteredData = (
  data: Array<StatisticalAnomaly | RiskSignal>, 
  selectedTimeFrame: '7d' | '30d' | '90d' | 'all'
) => {
  const now = new Date();
  let daysToSubtract = 30;
  
  switch (selectedTimeFrame) {
    case '7d':
      daysToSubtract = 7;
      break;
    case '30d':
      daysToSubtract = 30;
      break;
    case '90d':
      daysToSubtract = 90;
      break;
    case 'all':
      return data;
  }
  
  const cutoffDate = subDays(now, daysToSubtract);
  return data.filter(item => new Date(item.timestamp) >= cutoffDate);
};

/**
 * Processes anomalies by type for the bar chart
 */
export const processAnomaliesForChart = (anomalies: StatisticalAnomaly[], selectedTimeFrame: '7d' | '30d' | '90d' | 'all') => {
  const filteredAnomalies = getFilteredData(anomalies, selectedTimeFrame) as StatisticalAnomaly[];
  
  const anomalyCountsByType: Record<AnomalyType, number> = {
    'price_spike': 0,
    'volume_surge': 0,
    'volatility_explosion': 0,
    'correlation_break': 0,
    'pattern_deviation': 0,
    'momentum_shift': 0,
    'liquidity_change': 0,
    'option_skew_change': 0,
    'implied_volatility_divergence': 0
  };
  
  filteredAnomalies.forEach(anomaly => {
    anomalyCountsByType[anomaly.type]++;
  });
  
  return Object.entries(anomalyCountsByType).map(([type, count]) => ({
    type,
    count
  }));
};

/**
 * Processes anomalies by day for the time series chart
 */
export const processAnomaliesByDay = (anomalies: StatisticalAnomaly[], selectedTimeFrame: '7d' | '30d' | '90d' | 'all') => {
  const filteredAnomalies = getFilteredData(anomalies, selectedTimeFrame) as StatisticalAnomaly[];
  
  const anomaliesByDay: Record<string, number> = {};
  
  filteredAnomalies.forEach(anomaly => {
    const day = format(new Date(anomaly.timestamp), 'yyyy-MM-dd');
    anomaliesByDay[day] = (anomaliesByDay[day] || 0) + 1;
  });
  
  return Object.entries(anomaliesByDay)
    .map(([day, count]) => ({
      day,
      count
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
};

/**
 * Processes signals by confidence range for the confidence chart
 */
export const processSignalsByConfidence = (signals: RiskSignal[], selectedTimeFrame: '7d' | '30d' | '90d' | 'all') => {
  const filteredSignals = getFilteredData(signals, selectedTimeFrame) as RiskSignal[];
  
  const ranges: Record<string, number> = {
    '0-0.2': 0,
    '0.2-0.4': 0,
    '0.4-0.6': 0,
    '0.6-0.8': 0,
    '0.8-1.0': 0
  };
  
  filteredSignals.forEach(signal => {
    if (signal.confidence < 0.2) ranges['0-0.2']++;
    else if (signal.confidence < 0.4) ranges['0.2-0.4']++;
    else if (signal.confidence < 0.6) ranges['0.4-0.6']++;
    else if (signal.confidence < 0.8) ranges['0.6-0.8']++;
    else ranges['0.8-1.0']++;
  });
  
  return Object.entries(ranges).map(([range, count]) => ({
    range,
    count
  }));
};
