
import { v4 as uuidv4 } from 'uuid';
import { 
  StatisticalAnomaly, 
  AnomalyType, 
  DetectionMethod, 
  TimeWindow,
  AnomalyDetectionParams,
  AnomalyProcessorResult,
  RiskSignal,
  RiskActionType
} from '@/lib/types/spy/riskMonitoring';
import { 
  SpyMarketData, 
  SpyOption,
  SpyTrade 
} from '@/lib/types/spy';

// Default parameters for anomaly detection
const DEFAULT_DETECTION_PARAMS: AnomalyDetectionParams = {
  sensitivity: 0.7,
  lookbackPeriods: 20,
  minConfidence: 0.6,
  timeWindow: '1h',
  detectionMethods: ['zscore', 'bollinger_bands', 'moving_average'],
  anomalyTypes: [
    'price_spike', 
    'volume_surge', 
    'volatility_explosion', 
    'correlation_break',
    'option_skew_change'
  ],
  enabledDataSeries: ['price', 'volume', 'vix', 'option_iv', 'put_call_ratio']
};

/**
 * Calculate Z-score for a data point
 * Z-score measures how many standard deviations a data point is from the mean
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Calculate mean and standard deviation for an array of numbers
 */
function calculateStats(data: number[]): { mean: number; stdDev: number } {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  return { mean, stdDev };
}

/**
 * Detect price anomalies using Z-score method
 */
function detectPriceAnomalies(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[],
  params: AnomalyDetectionParams
): StatisticalAnomaly[] {
  const anomalies: StatisticalAnomaly[] = [];
  
  // Need enough data for statistical significance
  if (historicalData.length < params.lookbackPeriods) {
    return anomalies;
  }
  
  // Sort data chronologically
  const sortedData = [...historicalData].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Get recent data based on lookback period
  const recentData = sortedData.slice(-params.lookbackPeriods);
  
  // Calculate price changes (returns)
  const priceChanges = recentData.map((data, i) => {
    if (i === 0) return 0;
    return (data.price - recentData[i-1].price) / recentData[i-1].price * 100;
  }).slice(1); // Remove the first 0
  
  const { mean, stdDev } = calculateStats(priceChanges);
  
  // Calculate latest price change
  const previousPrice = sortedData[sortedData.length - 1].price;
  const currentPriceChange = (currentData.price - previousPrice) / previousPrice * 100;
  
  // Calculate Z-score
  const zScore = calculateZScore(currentPriceChange, mean, stdDev);
  
  // Anomaly threshold based on sensitivity
  const threshold = 2 + (1 - params.sensitivity) * 2; // Range: 2-4 standard deviations
  
  if (Math.abs(zScore) > threshold) {
    const direction = zScore > 0 ? 'bullish' : 'bearish';
    const confidence = Math.min(1, (Math.abs(zScore) - threshold) / 2 + 0.6);
    
    // Suggested actions based on anomaly direction and strength
    const suggestedActions: RiskActionType[] = [];
    if (direction === 'bullish' && confidence > 0.7) {
      suggestedActions.push('increase_position_size');
    } else if (direction === 'bearish' && confidence > 0.7) {
      suggestedActions.push('reduce_position_size');
      if (confidence > 0.85) {
        suggestedActions.push('hedge_position');
      }
    }
    
    anomalies.push({
      id: uuidv4(),
      timestamp: new Date(),
      type: 'price_spike',
      detectionMethod: 'zscore',
      timeWindow: params.timeWindow,
      metric: 'price_change',
      value: currentPriceChange,
      expectedValue: mean,
      deviation: currentPriceChange - mean,
      zScore,
      confidence,
      description: `Abnormal price movement of ${currentPriceChange.toFixed(2)}% (expected: ${mean.toFixed(2)}±${(stdDev * 2).toFixed(2)}%)`,
      suggestedActions,
      historicalOccurrences: priceChanges.filter(change => Math.abs(calculateZScore(change, mean, stdDev)) > threshold).length
    });
  }
  
  return anomalies;
}

/**
 * Detect volume anomalies
 */
function detectVolumeAnomalies(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[],
  params: AnomalyDetectionParams
): StatisticalAnomaly[] {
  const anomalies: StatisticalAnomaly[] = [];
  
  if (historicalData.length < params.lookbackPeriods || !params.enabledDataSeries.includes('volume')) {
    return anomalies;
  }
  
  // Sort data chronologically
  const sortedData = [...historicalData].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Get recent data based on lookback period
  const recentData = sortedData.slice(-params.lookbackPeriods);
  
  // Extract volumes
  const volumes = recentData.map(data => data.volume);
  
  const { mean, stdDev } = calculateStats(volumes);
  
  // Calculate Z-score for current volume
  const zScore = calculateZScore(currentData.volume, mean, stdDev);
  
  // Anomaly threshold based on sensitivity
  const threshold = 2 + (1 - params.sensitivity) * 2; // Range: 2-4 standard deviations
  
  if (zScore > threshold) { // Only care about volume spikes (not drops)
    const confidence = Math.min(1, (zScore - threshold) / 2 + 0.6);
    
    // Suggested actions based on volume spike
    const suggestedActions: RiskActionType[] = [];
    if (confidence > 0.8) {
      // High volume often indicates volatility
      suggestedActions.push('adjust_stop_loss');
      suggestedActions.push('adjust_take_profit');
    }
    
    anomalies.push({
      id: uuidv4(),
      timestamp: new Date(),
      type: 'volume_surge',
      detectionMethod: 'zscore',
      timeWindow: params.timeWindow,
      metric: 'volume',
      value: currentData.volume,
      expectedValue: mean,
      deviation: currentData.volume - mean,
      zScore,
      confidence,
      description: `Abnormal trading volume of ${currentData.volume.toLocaleString()} (${(zScore).toFixed(2)} standard deviations above normal)`,
      suggestedActions,
      historicalOccurrences: volumes.filter(vol => calculateZScore(vol, mean, stdDev) > threshold).length
    });
  }
  
  return anomalies;
}

/**
 * Detect volatility anomalies using VIX
 */
function detectVolatilityAnomalies(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[],
  params: AnomalyDetectionParams
): StatisticalAnomaly[] {
  const anomalies: StatisticalAnomaly[] = [];
  
  if (historicalData.length < params.lookbackPeriods || !params.enabledDataSeries.includes('vix')) {
    return anomalies;
  }
  
  // Sort data chronologically
  const sortedData = [...historicalData].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Get recent data based on lookback period
  const recentData = sortedData.slice(-params.lookbackPeriods);
  
  // Calculate VIX changes
  const vixChanges = recentData.map((data, i) => {
    if (i === 0) return 0;
    return (data.vix - recentData[i-1].vix) / recentData[i-1].vix * 100;
  }).slice(1); // Remove the first 0
  
  const { mean, stdDev } = calculateStats(vixChanges);
  
  // Calculate latest VIX change
  const previousVIX = sortedData[sortedData.length - 1].vix;
  const currentVIXChange = (currentData.vix - previousVIX) / previousVIX * 100;
  
  // Calculate Z-score
  const zScore = calculateZScore(currentVIXChange, mean, stdDev);
  
  // Anomaly threshold based on sensitivity
  const threshold = 1.8 + (1 - params.sensitivity) * 2; // More sensitive for VIX
  
  if (Math.abs(zScore) > threshold) {
    const confidence = Math.min(1, (Math.abs(zScore) - threshold) / 2 + 0.6);
    
    // Suggested actions based on VIX movement
    const suggestedActions: RiskActionType[] = [];
    
    if (currentVIXChange > 0 && confidence > 0.7) {
      // Rising VIX (increasing volatility)
      suggestedActions.push('adjust_stop_loss');
      if (confidence > 0.85) {
        suggestedActions.push('reduce_position_size');
        suggestedActions.push('hedge_position');
      }
    } else if (currentVIXChange < 0 && confidence > 0.8) {
      // Falling VIX (decreasing volatility)
      suggestedActions.push('adjust_take_profit');
    }
    
    anomalies.push({
      id: uuidv4(),
      timestamp: new Date(),
      type: 'volatility_explosion',
      detectionMethod: 'zscore',
      timeWindow: params.timeWindow,
      metric: 'vix_change',
      value: currentVIXChange,
      expectedValue: mean,
      deviation: currentVIXChange - mean,
      zScore,
      confidence,
      description: `Abnormal volatility change of ${currentVIXChange.toFixed(2)}% (VIX: ${currentData.vix.toFixed(2)})`,
      suggestedActions,
      historicalOccurrences: vixChanges.filter(change => Math.abs(calculateZScore(change, mean, stdDev)) > threshold).length
    });
  }
  
  return anomalies;
}

/**
 * Detect option skew anomalies
 */
function detectOptionSkewAnomalies(
  options: SpyOption[],
  historicalOptions: SpyOption[][],
  params: AnomalyDetectionParams
): StatisticalAnomaly[] {
  const anomalies: StatisticalAnomaly[] = [];
  
  if (historicalOptions.length < params.lookbackPeriods || !params.enabledDataSeries.includes('option_skew')) {
    return anomalies;
  }
  
  // Calculate put/call ratio (simplified version)
  const puts = options.filter(opt => opt.type === 'PUT');
  const calls = options.filter(opt => opt.type === 'CALL');
  
  if (puts.length === 0 || calls.length === 0) {
    return anomalies;
  }
  
  // Use average IV as a simple proxy for skew
  const avgPutIV = puts.reduce((sum, opt) => sum + opt.impliedVolatility, 0) / puts.length;
  const avgCallIV = calls.reduce((sum, opt) => sum + opt.impliedVolatility, 0) / calls.length;
  
  const currentSkew = avgPutIV / avgCallIV;
  
  // Calculate historical skews
  const historicalSkews = historicalOptions.map(optionSet => {
    const histPuts = optionSet.filter(opt => opt.type === 'PUT');
    const histCalls = optionSet.filter(opt => opt.type === 'CALL');
    
    if (histPuts.length === 0 || histCalls.length === 0) {
      return null;
    }
    
    const histAvgPutIV = histPuts.reduce((sum, opt) => sum + opt.impliedVolatility, 0) / histPuts.length;
    const histAvgCallIV = histCalls.reduce((sum, opt) => sum + opt.impliedVolatility, 0) / histCalls.length;
    
    return histAvgPutIV / histAvgCallIV;
  }).filter(skew => skew !== null) as number[];
  
  if (historicalSkews.length < params.lookbackPeriods / 2) {
    return anomalies;
  }
  
  const { mean, stdDev } = calculateStats(historicalSkews);
  
  // Calculate Z-score
  const zScore = calculateZScore(currentSkew, mean, stdDev);
  
  // Anomaly threshold based on sensitivity
  const threshold = 2 + (1 - params.sensitivity) * 2;
  
  if (Math.abs(zScore) > threshold) {
    const confidence = Math.min(1, (Math.abs(zScore) - threshold) / 2 + 0.6);
    
    // Suggested actions based on skew anomalies
    const suggestedActions: RiskActionType[] = [];
    
    if (currentSkew > mean && confidence > 0.75) {
      // High put/call skew indicates bearishness
      suggestedActions.push('reduce_position_size');
      if (confidence > 0.85) {
        suggestedActions.push('hedge_position');
      }
    } else if (currentSkew < mean && confidence > 0.75) {
      // Low put/call skew indicates bullishness
      suggestedActions.push('increase_position_size');
    }
    
    anomalies.push({
      id: uuidv4(),
      timestamp: new Date(),
      type: 'option_skew_change',
      detectionMethod: 'zscore',
      timeWindow: params.timeWindow,
      metric: 'put_call_iv_ratio',
      value: currentSkew,
      expectedValue: mean,
      deviation: currentSkew - mean,
      zScore,
      confidence,
      description: `Unusual options skew of ${currentSkew.toFixed(2)} (put/call IV ratio)`,
      suggestedActions,
      historicalOccurrences: historicalSkews.filter(skew => Math.abs(calculateZScore(skew, mean, stdDev)) > threshold).length
    });
  }
  
  return anomalies;
}

/**
 * Detect correlation breaks between SPY and VIX
 */
function detectCorrelationBreaks(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[],
  params: AnomalyDetectionParams
): StatisticalAnomaly[] {
  const anomalies: StatisticalAnomaly[] = [];
  
  if (historicalData.length < params.lookbackPeriods) {
    return anomalies;
  }
  
  // Sort data chronologically
  const sortedData = [...historicalData].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Get recent data
  const recentData = sortedData.slice(-params.lookbackPeriods);
  
  // Calculate returns and VIX changes
  const returns = recentData.map((data, i) => {
    if (i === 0) return 0;
    return (data.price - recentData[i-1].price) / recentData[i-1].price * 100;
  }).slice(1);
  
  const vixChanges = recentData.map((data, i) => {
    if (i === 0) return 0;
    return (data.vix - recentData[i-1].vix) / recentData[i-1].vix * 100;
  }).slice(1);
  
  // Calculate correlation coefficient between returns and VIX changes
  // Normally, they should be negatively correlated
  const n = returns.length;
  let sum_xy = 0;
  let sum_x = 0;
  let sum_y = 0;
  let sum_x2 = 0;
  let sum_y2 = 0;
  
  for (let i = 0; i < n; i++) {
    sum_x += returns[i];
    sum_y += vixChanges[i];
    sum_xy += returns[i] * vixChanges[i];
    sum_x2 += returns[i] * returns[i];
    sum_y2 += vixChanges[i] * vixChanges[i];
  }
  
  const correlation = (n * sum_xy - sum_x * sum_y) / 
                     (Math.sqrt(n * sum_x2 - sum_x * sum_x) * Math.sqrt(n * sum_y2 - sum_y * sum_y));
  
  // Typically, SPY and VIX are negatively correlated
  // If correlation becomes positive, it's an anomaly
  if (correlation > -0.3 * params.sensitivity) {
    // The more positive the correlation, the stronger the anomaly
    const confidence = Math.min(1, (correlation + 0.3) * 1.5);
    
    anomalies.push({
      id: uuidv4(),
      timestamp: new Date(),
      type: 'correlation_break',
      detectionMethod: 'moving_average',
      timeWindow: params.timeWindow,
      metric: 'spy_vix_correlation',
      value: correlation,
      expectedValue: -0.7, // Expected negative correlation
      deviation: correlation - (-0.7),
      zScore: (correlation - (-0.7)) / 0.3, // Approximated Z-score
      confidence,
      description: `Unusual SPY-VIX correlation of ${correlation.toFixed(2)} (normally negative)`,
      suggestedActions: confidence > 0.8 ? ['adjust_stop_loss', 'hedge_position'] : ['adjust_stop_loss'],
      historicalOccurrences: 0 // This would require historical correlation data
    });
  }
  
  return anomalies;
}

/**
 * Process market data and detect anomalies
 */
export function detectAnomalies(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[],
  currentOptions: SpyOption[],
  historicalOptions: SpyOption[][] = [],
  params: AnomalyDetectionParams = DEFAULT_DETECTION_PARAMS
): AnomalyProcessorResult {
  const startTime = Date.now();
  const anomalies: StatisticalAnomaly[] = [];
  
  // Run different anomaly detection algorithms based on enabled types
  if (params.anomalyTypes.includes('price_spike')) {
    anomalies.push(...detectPriceAnomalies(currentData, historicalData, params));
  }
  
  if (params.anomalyTypes.includes('volume_surge')) {
    anomalies.push(...detectVolumeAnomalies(currentData, historicalData, params));
  }
  
  if (params.anomalyTypes.includes('volatility_explosion')) {
    anomalies.push(...detectVolatilityAnomalies(currentData, historicalData, params));
  }
  
  if (params.anomalyTypes.includes('option_skew_change') && currentOptions.length > 0) {
    anomalies.push(...detectOptionSkewAnomalies(currentOptions, historicalOptions, params));
  }
  
  if (params.anomalyTypes.includes('correlation_break')) {
    anomalies.push(...detectCorrelationBreaks(currentData, historicalData, params));
  }
  
  // Filter anomalies by confidence threshold
  const filteredAnomalies = anomalies.filter(anomaly => 
    anomaly.confidence >= params.minConfidence
  );
  
  // Determine if threshold for alerting/action is met
  const triggerThresholdMet = filteredAnomalies.some(anomaly => 
    anomaly.confidence > 0.8
  );
  
  return {
    anomalies: filteredAnomalies,
    processedDataPoints: historicalData.length,
    detectionTimestamp: new Date(),
    executionTimeMs: Date.now() - startTime,
    triggerThresholdMet
  };
}

/**
 * Convert statistical anomalies to risk signals
 */
export function anomaliesToRiskSignals(anomalies: StatisticalAnomaly[]): RiskSignal[] {
  return anomalies.map(anomaly => {
    // Map anomaly type to signal source
    let source: RiskSignalSource = 'technical';
    let condition: 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'trending' | 'ranging' = 'neutral';
    
    switch (anomaly.type) {
      case 'price_spike':
        source = 'price';
        condition = anomaly.value > anomaly.expectedValue ? 'bullish' : 'bearish';
        break;
      case 'volume_surge':
        source = 'volume';
        condition = 'volatile';
        break;
      case 'volatility_explosion':
        source = 'volatility';
        condition = 'volatile';
        break;
      case 'correlation_break':
        source = 'technical';
        condition = 'volatile';
        break;
      case 'option_skew_change':
        source = 'technical';
        condition = anomaly.value > anomaly.expectedValue ? 'bearish' : 'bullish';
        break;
      default:
        source = 'technical';
        condition = 'neutral';
    }
    
    // Map confidence to strength
    let strength: RiskSignalStrength = 'moderate';
    if (anomaly.confidence > 0.85) {
      strength = 'extreme';
    } else if (anomaly.confidence > 0.75) {
      strength = 'strong';
    } else if (anomaly.confidence < 0.65) {
      strength = 'weak';
    }
    
    // Determine direction
    let direction: RiskSignalDirection = 'neutral';
    if (condition === 'bullish') {
      direction = 'bullish';
    } else if (condition === 'bearish') {
      direction = 'bearish';
    }
    
    return {
      id: uuidv4(),
      timestamp: new Date(),
      source,
      condition,
      strength,
      direction,
      description: anomaly.description,
      confidence: anomaly.confidence,
      dataPoints: {
        anomalyId: anomaly.id,
        type: anomaly.type,
        metric: anomaly.metric,
        value: anomaly.value,
        expectedValue: anomaly.expectedValue,
        zScore: anomaly.zScore
      }
    };
  });
}

/**
 * Analyze trade performance on historical anomalies
 * This helps determine how well trades perform when initiated after specific anomalies
 */
export function analyzeAnomalyTradePerformance(
  completedTrades: SpyTrade[],
  historicalAnomalies: StatisticalAnomaly[]
): Record<AnomalyType, { 
  successRate: number; 
  avgProfit: number; 
  tradeCount: number; 
  bestDirection: 'CALL' | 'PUT' | null;
}> {
  const anomalyPerformance: Record<AnomalyType, {
    successRate: number;
    avgProfit: number;
    tradeCount: number;
    callSuccessRate: number;
    putSuccessRate: number;
    callTradeCount: number;
    putTradeCount: number;
    bestDirection: 'CALL' | 'PUT' | null;
  }> = {};
  
  // Initialize performance record for each anomaly type
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
  
  anomalyTypes.forEach(type => {
    anomalyPerformance[type] = {
      successRate: 0,
      avgProfit: 0,
      tradeCount: 0,
      callSuccessRate: 0,
      putSuccessRate: 0,
      callTradeCount: 0,
      putTradeCount: 0,
      bestDirection: null
    };
  });
  
  // For each completed trade, check if it was initiated near an anomaly
  completedTrades.forEach(trade => {
    if (!trade.openedAt || !trade.closedAt || trade.profit === undefined) {
      return;
    }
    
    const tradeOpenTime = trade.openedAt.getTime();
    
    // Find anomalies that occurred within 4 hours before the trade
    const relevantAnomalies = historicalAnomalies.filter(anomaly => {
      const anomalyTime = anomaly.timestamp.getTime();
      const hoursDifference = (tradeOpenTime - anomalyTime) / (1000 * 60 * 60);
      
      return hoursDifference >= 0 && hoursDifference <= 4;
    });
    
    // If trade was opened after anomalies, record its performance
    relevantAnomalies.forEach(anomaly => {
      const perfRecord = anomalyPerformance[anomaly.type];
      
      // Count trades
      perfRecord.tradeCount++;
      
      // Track trade type
      if (trade.type === 'CALL') {
        perfRecord.callTradeCount++;
      } else {
        perfRecord.putTradeCount++;
      }
      
      // Was this trade successful?
      const isSuccess = trade.profit > 0;
      
      // Update success rates
      if (isSuccess) {
        if (trade.type === 'CALL') {
          perfRecord.callSuccessRate = (perfRecord.callSuccessRate * (perfRecord.callTradeCount - 1) + 1) / perfRecord.callTradeCount;
        } else {
          perfRecord.putSuccessRate = (perfRecord.putSuccessRate * (perfRecord.putTradeCount - 1) + 1) / perfRecord.putTradeCount;
        }
      }
      
      // Update overall performance metrics
      perfRecord.successRate = (perfRecord.successRate * (perfRecord.tradeCount - 1) + (isSuccess ? 1 : 0)) / perfRecord.tradeCount;
      perfRecord.avgProfit = (perfRecord.avgProfit * (perfRecord.tradeCount - 1) + trade.profit) / perfRecord.tradeCount;
      
      // Determine best direction
      if (perfRecord.callTradeCount > 3 && perfRecord.putTradeCount > 3) {
        perfRecord.bestDirection = perfRecord.callSuccessRate > perfRecord.putSuccessRate ? 'CALL' : 'PUT';
      }
    });
  });
  
  // Simplify the result to return only what's needed
  const result: Record<AnomalyType, { 
    successRate: number; 
    avgProfit: number; 
    tradeCount: number; 
    bestDirection: 'CALL' | 'PUT' | null;
  }> = {};
  
  anomalyTypes.forEach(type => {
    const perf = anomalyPerformance[type];
    result[type] = {
      successRate: perf.successRate,
      avgProfit: perf.avgProfit,
      tradeCount: perf.tradeCount,
      bestDirection: perf.bestDirection
    };
  });
  
  return result;
}

/**
 * Get trading suggestions based on detected anomalies
 */
export function getAnomalyTradingSuggestions(
  anomalies: StatisticalAnomaly[],
  historicalPerformance: Record<AnomalyType, { 
    successRate: number; 
    avgProfit: number; 
    tradeCount: number; 
    bestDirection: 'CALL' | 'PUT' | null;
  }> = {}
): Array<{
  anomalyId: string;
  anomalyType: AnomalyType;
  confidence: number;
  recommendation: string;
  optionType?: 'CALL' | 'PUT';
  expectedSuccessRate?: number;
  historicalAvgProfit?: number;
  priority: number; // 1-10, higher is more important
}> {
  return anomalies
    .filter(anomaly => anomaly.confidence > 0.65)
    .map(anomaly => {
      const perfData = historicalPerformance[anomaly.type];
      const hasEnoughData = perfData && perfData.tradeCount >= 5;
      
      let recommendation = '';
      let optionType: 'CALL' | 'PUT' | undefined;
      let priority = Math.round(anomaly.confidence * 10);
      
      // Base recommendation on anomaly type and historical performance
      switch (anomaly.type) {
        case 'price_spike': {
          if (anomaly.value > anomaly.expectedValue) {
            recommendation = 'Consider bullish position due to abnormal price spike';
            optionType = hasEnoughData ? perfData.bestDirection || 'CALL' : 'CALL';
          } else {
            recommendation = 'Consider bearish position due to abnormal price drop';
            optionType = hasEnoughData ? perfData.bestDirection || 'PUT' : 'PUT';
          }
          break;
        }
        case 'volume_surge': {
          recommendation = 'Prepare for increased volatility due to volume surge';
          optionType = hasEnoughData ? perfData.bestDirection : undefined;
          break;
        }
        case 'volatility_explosion': {
          if (anomaly.value > 0) {
            recommendation = 'Consider volatility strategies due to VIX spike';
            // For rising volatility, often PUT perform better
            optionType = hasEnoughData ? perfData.bestDirection || 'PUT' : 'PUT';
          } else {
            recommendation = 'Consider directional strategies as volatility decreases';
            optionType = hasEnoughData ? perfData.bestDirection : undefined;
          }
          break;
        }
        case 'correlation_break': {
          recommendation = 'Unusual market behavior detected - exercise caution';
          optionType = hasEnoughData ? perfData.bestDirection : undefined;
          priority += 2; // Correlation breaks often precede major moves
          break;
        }
        case 'option_skew_change': {
          if (anomaly.value > anomaly.expectedValue) {
            recommendation = 'Options market signaling bearish sentiment';
            optionType = hasEnoughData ? perfData.bestDirection || 'PUT' : 'PUT';
          } else {
            recommendation = 'Options market signaling bullish sentiment';
            optionType = hasEnoughData ? perfData.bestDirection || 'CALL' : 'CALL';
          }
          priority += 1; // Option market often has predictive power
          break;
        }
        default: {
          recommendation = `Anomaly detected in ${anomaly.type}`;
          optionType = hasEnoughData ? perfData.bestDirection : undefined;
        }
      }
      
      return {
        anomalyId: anomaly.id,
        anomalyType: anomaly.type,
        confidence: anomaly.confidence,
        recommendation,
        optionType,
        expectedSuccessRate: hasEnoughData ? perfData.successRate : undefined,
        historicalAvgProfit: hasEnoughData ? perfData.avgProfit : undefined,
        priority
      };
    })
    .sort((a, b) => b.priority - a.priority); // Sort by priority
}

export const anomalyDetectionService = {
  detectAnomalies,
  anomaliesToRiskSignals,
  analyzeAnomalyTradePerformance,
  getAnomalyTradingSuggestions,
  DEFAULT_DETECTION_PARAMS
};

export default anomalyDetectionService;
