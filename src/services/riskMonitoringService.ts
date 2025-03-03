
import { v4 as uuidv4 } from 'uuid';
import { 
  RiskSignal,
  RiskAction,
  RiskMonitoringLog,
  LearningInsight,
  RiskSignalSource,
  RiskSignalStrength,
  RiskActionType,
  MarketRiskProfile
} from '@/lib/types/spy/riskMonitoring';
import { 
  AITradingSettings, 
  SpyMarketData, 
  SpyTrade,
  SpyOption,
  MarketCondition,
  RiskToleranceType
} from '@/lib/types/spy';

// Initialize the monitoring log (in a real app, this would be persisted to a database)
let monitoringLog: RiskMonitoringLog = {
  signals: [],
  actions: [],
  learningInsights: []
};

/**
 * Detect risk signals based on market data and current conditions
 */
export const detectRiskSignals = (
  marketData: SpyMarketData,
  historicalMarketData: SpyMarketData[],
  currentTrades: SpyTrade[],
  settings: AITradingSettings
): RiskSignal[] => {
  const signals: RiskSignal[] = [];
  const currentMarketProfile = analyzeMarketCondition(marketData, historicalMarketData);
  
  // Technical signals
  signals.push(...detectTechnicalSignals(marketData, historicalMarketData, currentMarketProfile));
  
  // Volatility signals
  signals.push(...detectVolatilitySignals(marketData, historicalMarketData, currentMarketProfile));
  
  // Economic data signals
  if (settings.considerEconomicData) {
    signals.push(...detectEconomicSignals(currentMarketProfile));
  }
  
  // Earnings signals
  if (settings.considerEarningsEvents) {
    signals.push(...detectEarningsSignals(currentTrades, currentMarketProfile));
  }
  
  // Fed meeting signals
  if (settings.considerFedMeetings) {
    signals.push(...detectFedMeetingSignals(currentMarketProfile));
  }
  
  // Geopolitical signals
  if (settings.considerGeopoliticalEvents) {
    signals.push(...detectGeopoliticalSignals(currentMarketProfile));
  }
  
  // Market sentiment signals
  if (settings.useMarketSentiment) {
    signals.push(...detectSentimentSignals(currentMarketProfile));
  }
  
  // Store signals in the log
  monitoringLog.signals.push(...signals);
  
  return signals;
};

/**
 * Determine appropriate risk actions based on detected signals and user risk tolerance
 */
export const determineRiskActions = (
  signals: RiskSignal[],
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType
): RiskAction[] => {
  const actions: RiskAction[] = [];
  
  if (signals.length === 0 || currentTrades.length === 0) {
    return actions;
  }
  
  // Group signals by source and direction
  const groupedSignals = groupSignalsBySourceAndDirection(signals);
  
  // Process technical signals
  processTechnicalSignals(groupedSignals, currentTrades, settings, currentRiskTolerance, actions);
  
  // Process volatility signals
  processVolatilitySignals(groupedSignals, currentTrades, settings, currentRiskTolerance, actions);
  
  // Process economic signals
  processEconomicSignals(groupedSignals, currentTrades, settings, currentRiskTolerance, actions);
  
  // Process sentiment signals
  processSentimentSignals(groupedSignals, currentTrades, settings, currentRiskTolerance, actions);
  
  // Store actions in the log
  monitoringLog.actions.push(...actions);
  
  return actions;
};

/**
 * Apply risk actions to trades
 */
export const applyRiskActions = (
  actions: RiskAction[],
  currentTrades: SpyTrade[],
  availableOptions: SpyOption[],
  settings: AITradingSettings
): SpyTrade[] => {
  const updatedTrades = [...currentTrades];
  
  // Process each action
  for (const action of actions) {
    const tradesToModify = updatedTrades.filter(t => 
      t.status === 'active' && action.tradeIds.includes(t.id)
    );
    
    if (tradesToModify.length === 0) continue;
    
    switch (action.actionType) {
      case 'reduce_position_size':
        applyReducePositionSize(tradesToModify, action, updatedTrades);
        break;
      case 'increase_position_size':
        applyIncreasePositionSize(tradesToModify, action, updatedTrades, availableOptions);
        break;
      case 'exit_trade':
        applyExitTrade(tradesToModify, action, updatedTrades);
        break;
      case 'hedge_position':
        applyHedgePosition(tradesToModify, action, updatedTrades, availableOptions, settings);
        break;
      case 'adjust_stop_loss':
        applyAdjustStopLoss(tradesToModify, action);
        break;
      case 'adjust_take_profit':
        applyAdjustTakeProfit(tradesToModify, action);
        break;
      case 'convert_to_spread':
        applyConvertToSpread(tradesToModify, action, updatedTrades, availableOptions);
        break;
    }
  }
  
  return updatedTrades;
};

/**
 * Learn from past risk actions and their outcomes
 */
export const learnFromRiskActionOutcomes = (
  completedTrades: SpyTrade[],
  historicalActions: RiskAction[]
): LearningInsight[] => {
  // Find actions that affected completed trades
  const relevantActions = historicalActions.filter(action => 
    action.tradeIds.some(id => 
      completedTrades.some(trade => trade.id === id)
    )
  );
  
  if (relevantActions.length === 0) {
    return [];
  }
  
  // Group actions by signal pattern
  const actionsByPattern = groupActionsBySignalPattern(relevantActions);
  
  // Generate insights
  const insights: LearningInsight[] = [];
  
  for (const [patternKey, actions] of Object.entries(actionsByPattern)) {
    const [source, condition, strength, direction] = patternKey.split('|') as [
      RiskSignalSource, 
      MarketCondition, 
      RiskSignalStrength, 
      RiskSignalDirection
    ];
    
    // Calculate success rate
    const successCount = actions.filter(a => a.success).length;
    const successRate = successCount / actions.length;
    
    // Calculate average profit impact
    const totalProfitImpact = actions.reduce((sum, a) => sum + (a.profitImpact || 0), 0);
    const averageProfitImpact = totalProfitImpact / actions.length;
    
    // Determine recommended actions based on success
    const actionTypeCounts: Record<RiskActionType, { count: number, profit: number }> = {} as any;
    
    for (const action of actions) {
      if (!actionTypeCounts[action.actionType]) {
        actionTypeCounts[action.actionType] = { count: 0, profit: 0 };
      }
      
      actionTypeCounts[action.actionType].count++;
      actionTypeCounts[action.actionType].profit += action.profitImpact || 0;
    }
    
    // Sort action types by average profit impact
    const recommendedActions = Object.entries(actionTypeCounts)
      .sort(([, a], [, b]) => (b.profit / b.count) - (a.profit / a.count))
      .map(([actionType]) => actionType as RiskActionType);
    
    // Create insight
    const insight: LearningInsight = {
      id: uuidv4(),
      timestamp: new Date(),
      description: `Pattern: ${direction} ${strength} ${source} signal during ${condition} market`,
      signalPattern: {
        source,
        condition,
        strength,
        direction
      },
      successRate,
      averageProfitImpact,
      recommendedActions: recommendedActions.slice(0, 3), // Top 3 recommendations
      confidence: calculateInsightConfidence(actions.length, successRate)
    };
    
    insights.push(insight);
  }
  
  // Store insights in the log
  monitoringLog.learningInsights.push(...insights);
  
  return insights;
};

/**
 * Get recommended actions for a specific signal based on learned insights
 */
export const getRecommendedActionsForSignal = (
  signal: RiskSignal,
  insights: LearningInsight[]
): RiskActionType[] => {
  // Find matching insights
  const matchingInsights = insights.filter(insight => 
    insight.signalPattern.source === signal.source &&
    insight.signalPattern.condition === signal.condition &&
    insight.signalPattern.strength === signal.strength &&
    insight.signalPattern.direction === signal.direction
  );
  
  if (matchingInsights.length === 0) {
    // Return default actions based on signal direction
    if (signal.direction === 'bearish') {
      return ['reduce_position_size', 'adjust_stop_loss', 'hedge_position'];
    } else if (signal.direction === 'bullish') {
      return ['increase_position_size', 'adjust_take_profit'];
    } else {
      return ['no_action'];
    }
  }
  
  // Sort insights by confidence
  const sortedInsights = [...matchingInsights].sort((a, b) => b.confidence - a.confidence);
  
  // Return recommended actions from highest confidence insight
  return sortedInsights[0].recommendedActions;
};

/**
 * Get the full monitoring log
 */
export const getMonitoringLog = (): RiskMonitoringLog => {
  return { ...monitoringLog };
};

/**
 * Reset the monitoring log (mainly for testing)
 */
export const resetMonitoringLog = (): void => {
  monitoringLog = {
    signals: [],
    actions: [],
    learningInsights: []
  };
};

/**
 * Export monitoring log data
 */
export const exportMonitoringLog = (): string => {
  return JSON.stringify(monitoringLog, null, 2);
};

/**
 * Import monitoring log data
 */
export const importMonitoringLog = (logData: string): boolean => {
  try {
    const parsedLog = JSON.parse(logData) as RiskMonitoringLog;
    
    // Validate structure
    if (!parsedLog.signals || !parsedLog.actions || !parsedLog.learningInsights) {
      return false;
    }
    
    // Convert date strings to Date objects
    parsedLog.signals.forEach(signal => {
      signal.timestamp = new Date(signal.timestamp);
    });
    
    parsedLog.actions.forEach(action => {
      action.timestamp = new Date(action.timestamp);
    });
    
    parsedLog.learningInsights.forEach(insight => {
      insight.timestamp = new Date(insight.timestamp);
    });
    
    monitoringLog = parsedLog;
    return true;
  } catch (error) {
    console.error('Failed to import monitoring log:', error);
    return false;
  }
};

// Helper functions

/**
 * Analyze the current market condition
 */
function analyzeMarketCondition(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[]
): MarketRiskProfile {
  // Need at least 10 days of data
  if (historicalData.length < 10) {
    return {
      currentCondition: 'neutral',
      volatilityLevel: 0.5,
      sentimentScore: 0,
      marketTrendStrength: 0.5,
      marketTrendDirection: 'neutral',
      keyRiskFactors: [],
      compositeRiskScore: 0.5
    };
  }
  
  // Sort historical data by timestamp (oldest first)
  const sortedData = [...historicalData].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Calculate 10-day moving average
  const last10Days = sortedData.slice(-10);
  const ma10 = last10Days.reduce((sum, data) => sum + data.price, 0) / 10;
  
  // Calculate 20-day moving average
  const last20Days = sortedData.slice(-20);
  const ma20 = last20Days.length === 20 
    ? last20Days.reduce((sum, data) => sum + data.price, 0) / 20 
    : ma10;
  
  // Calculate trend direction and strength
  const trendDirection = currentData.price > ma10 
    ? 'bullish' 
    : currentData.price < ma10 
      ? 'bearish' 
      : 'neutral';
      
  const trendStrength = Math.min(
    1, 
    Math.abs(currentData.price - ma10) / (ma10 * 0.02)
  );
  
  // Determine market condition
  let condition: MarketCondition;
  if (currentData.vix >= 25) {
    condition = 'volatile';
  } else if (trendDirection === 'bullish' && trendStrength > 0.5) {
    condition = 'bullish';
  } else if (trendDirection === 'bearish' && trendStrength > 0.5) {
    condition = 'bearish';
  } else {
    condition = 'neutral';
  }
  
  // Calculate volatility level (normalized VIX)
  const volatilityLevel = Math.min(1, currentData.vix / 50);
  
  // Simple sentiment score calculation
  // In a real app, this would come from news sentiment analysis
  const sentimentScore = trendDirection === 'bullish' 
    ? 0.5 
    : trendDirection === 'bearish' 
      ? -0.5 
      : 0;
  
  // Key risk factors
  const keyRiskFactors = [];
  
  if (volatilityLevel > 0.6) {
    keyRiskFactors.push({
      source: 'volatility' as RiskSignalSource,
      impact: volatilityLevel,
      description: 'High market volatility'
    });
  }
  
  if (Math.abs(currentData.price / ma20 - 1) > 0.05) {
    keyRiskFactors.push({
      source: 'momentum' as RiskSignalSource,
      impact: Math.min(1, Math.abs(currentData.price / ma20 - 1) * 10),
      description: `${currentData.price > ma20 ? 'Overbought' : 'Oversold'} conditions`
    });
  }
  
  // Calculate composite risk score
  const compositeRiskScore = (
    volatilityLevel * 0.4 + 
    trendStrength * 0.3 + 
    Math.abs(sentimentScore) * 0.3
  );
  
  return {
    currentCondition: condition,
    volatilityLevel,
    sentimentScore,
    marketTrendStrength: trendStrength,
    marketTrendDirection: trendDirection as any,
    keyRiskFactors,
    compositeRiskScore
  };
}

/**
 * Detect technical signals
 */
function detectTechnicalSignals(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[],
  marketProfile: MarketRiskProfile
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  // Sort historical data
  const sortedData = [...historicalData].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  // Calculate RSI (simplified)
  const rsi = calculateSimplifiedRSI(sortedData);
  
  // RSI overbought signal
  if (rsi >= 70) {
    signals.push({
      id: uuidv4(),
      timestamp: new Date(),
      source: 'technical',
      condition: marketProfile.currentCondition,
      strength: rsi >= 80 ? 'strong' : 'moderate',
      direction: 'bearish',
      description: `RSI overbought at ${rsi.toFixed(2)}`,
      dataPoints: { rsi },
      confidence: Math.min(1, (rsi - 70) / 30 + 0.6)
    });
  }
  
  // RSI oversold signal
  if (rsi <= 30) {
    signals.push({
      id: uuidv4(),
      timestamp: new Date(),
      source: 'technical',
      condition: marketProfile.currentCondition,
      strength: rsi <= 20 ? 'strong' : 'moderate',
      direction: 'bullish',
      description: `RSI oversold at ${rsi.toFixed(2)}`,
      dataPoints: { rsi },
      confidence: Math.min(1, (30 - rsi) / 30 + 0.6)
    });
  }
  
  // Price crossing moving averages
  if (sortedData.length >= 20) {
    const last10Days = sortedData.slice(-10);
    const ma10 = last10Days.reduce((sum, data) => sum + data.price, 0) / 10;
    
    const last20Days = sortedData.slice(-20);
    const ma20 = last20Days.reduce((sum, data) => sum + data.price, 0) / 20;
    
    const previousPrice = sortedData[sortedData.length - 2].price;
    
    // Price crossed above 20-day MA
    if (previousPrice < ma20 && currentData.price > ma20) {
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'technical',
        condition: marketProfile.currentCondition,
        strength: 'moderate',
        direction: 'bullish',
        description: 'Price crossed above 20-day moving average',
        dataPoints: { ma20, currentPrice: currentData.price },
        confidence: 0.7
      });
    }
    
    // Price crossed below 20-day MA
    if (previousPrice > ma20 && currentData.price < ma20) {
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'technical',
        condition: marketProfile.currentCondition,
        strength: 'moderate',
        direction: 'bearish',
        description: 'Price crossed below 20-day moving average',
        dataPoints: { ma20, currentPrice: currentData.price },
        confidence: 0.7
      });
    }
    
    // MA10 crossed above MA20 (golden cross)
    if (last10Days.length === 10 && last20Days.length === 20) {
      const previousMA10 = sortedData.slice(-11, -1).reduce((sum, data) => sum + data.price, 0) / 10;
      
      if (previousMA10 < ma20 && ma10 > ma20) {
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'technical',
          condition: marketProfile.currentCondition,
          strength: 'strong',
          direction: 'bullish',
          description: '10-day MA crossed above 20-day MA (golden cross)',
          dataPoints: { ma10, ma20 },
          confidence: 0.8
        });
      }
      
      // MA10 crossed below MA20 (death cross)
      if (previousMA10 > ma20 && ma10 < ma20) {
        signals.push({
          id: uuidv4(),
          timestamp: new Date(),
          source: 'technical',
          condition: marketProfile.currentCondition,
          strength: 'strong',
          direction: 'bearish',
          description: '10-day MA crossed below 20-day MA (death cross)',
          dataPoints: { ma10, ma20 },
          confidence: 0.8
        });
      }
    }
  }
  
  return signals;
}

/**
 * Detect volatility signals
 */
function detectVolatilitySignals(
  currentData: SpyMarketData,
  historicalData: SpyMarketData[],
  marketProfile: MarketRiskProfile
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  // VIX spike signal
  if (historicalData.length >= 5) {
    const sortedData = [...historicalData].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const previousVIX = sortedData[sortedData.length - 2].vix;
    const vixChange = (currentData.vix - previousVIX) / previousVIX;
    
    if (vixChange >= 0.1) { // 10% or more increase
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'volatility',
        condition: marketProfile.currentCondition,
        strength: vixChange >= 0.2 ? 'strong' : 'moderate',
        direction: 'bearish',
        description: `VIX spiked by ${(vixChange * 100).toFixed(2)}%`,
        dataPoints: { 
          currentVIX: currentData.vix, 
          previousVIX, 
          percentChange: vixChange * 100 
        },
        confidence: Math.min(1, vixChange + 0.6)
      });
    }
    
    if (vixChange <= -0.1) { // 10% or more decrease
      signals.push({
        id: uuidv4(),
        timestamp: new Date(),
        source: 'volatility',
        condition: marketProfile.currentCondition,
        strength: vixChange <= -0.2 ? 'strong' : 'moderate',
        direction: 'bullish',
        description: `VIX dropped by ${Math.abs(vixChange * 100).toFixed(2)}%`,
        dataPoints: { 
          currentVIX: currentData.vix, 
          previousVIX, 
          percentChange: vixChange * 100 
        },
        confidence: Math.min(1, Math.abs(vixChange) + 0.6)
      });
    }
  }
  
  // Absolute VIX level signals
  if (currentData.vix >= 30 && currentData.vix < 40) {
    signals.push({
      id: uuidv4(),
      timestamp: new Date(),
      source: 'volatility',
      condition: marketProfile.currentCondition,
      strength: 'strong',
      direction: 'bearish',
      description: `High VIX level at ${currentData.vix.toFixed(2)}`,
      dataPoints: { vix: currentData.vix },
      confidence: 0.8
    });
  } else if (currentData.vix >= 40) {
    signals.push({
      id: uuidv4(),
      timestamp: new Date(),
      source: 'volatility',
      condition: marketProfile.currentCondition,
      strength: 'extreme',
      direction: 'bearish',
      description: `Extreme VIX level at ${currentData.vix.toFixed(2)}`,
      dataPoints: { vix: currentData.vix },
      confidence: 0.9
    });
  } else if (currentData.vix <= 15) {
    signals.push({
      id: uuidv4(),
      timestamp: new Date(),
      source: 'volatility',
      condition: marketProfile.currentCondition,
      strength: 'moderate',
      direction: 'bullish',
      description: `Low VIX level at ${currentData.vix.toFixed(2)}`,
      dataPoints: { vix: currentData.vix },
      confidence: 0.7
    });
  }
  
  return signals;
}

/**
 * Detect economic signals (simplified, would use actual economic data in production)
 */
function detectEconomicSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would use actual economic data sources
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Detect earnings signals 
 */
function detectEarningsSignals(
  currentTrades: SpyTrade[],
  marketProfile: MarketRiskProfile
): RiskSignal[] {
  // In a real implementation, this would check for upcoming earnings
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Detect Fed meeting signals
 */
function detectFedMeetingSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would check for upcoming Fed meetings
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Detect geopolitical signals
 */
function detectGeopoliticalSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would use news APIs or other data sources
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Detect sentiment signals
 */
function detectSentimentSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would use social media sentiment data
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Group signals by source and direction
 */
function groupSignalsBySourceAndDirection(signals: RiskSignal[]): Record<string, RiskSignal[]> {
  const grouped: Record<string, RiskSignal[]> = {};
  
  for (const signal of signals) {
    const key = `${signal.source}_${signal.direction}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(signal);
  }
  
  return grouped;
}

/**
 * Process technical signals
 */
function processTechnicalSignals(
  groupedSignals: Record<string, RiskSignal[]>,
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType,
  actions: RiskAction[]
): void {
  // Get bullish and bearish technical signals
  const bullishSignals = groupedSignals['technical_bullish'] || [];
  const bearishSignals = groupedSignals['technical_bearish'] || [];
  
  // Process bearish signals
  if (bearishSignals.length > 0) {
    // Sort by confidence
    const sortedSignals = [...bearishSignals].sort((a, b) => b.confidence - a.confidence);
    const highestConfidenceSignal = sortedSignals[0];
    
    // Find CALL trades that might be at risk
    const callTrades = currentTrades.filter(t => 
      t.status === 'active' && t.type === 'CALL'
    );
    
    if (callTrades.length > 0) {
      // Determine action based on signal strength and risk tolerance
      let actionType: RiskActionType = 'no_action';
      let riskReduction = 0;
      
      switch (highestConfidenceSignal.strength) {
        case 'extreme':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'exit_trade' 
            : 'reduce_position_size';
          riskReduction = 0.7;
          break;
        case 'strong':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'reduce_position_size' 
            : currentRiskTolerance === 'moderate'
              ? 'adjust_stop_loss'
              : 'no_action';
          riskReduction = 0.5;
          break;
        case 'moderate':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'adjust_stop_loss' 
            : 'no_action';
          riskReduction = 0.3;
          break;
        case 'weak':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'adjust_stop_loss' 
            : 'no_action';
          riskReduction = 0.1;
          break;
      }
      
      if (actionType !== 'no_action') {
        actions.push({
          id: uuidv4(),
          signalId: highestConfidenceSignal.id,
          timestamp: new Date(),
          actionType,
          tradeIds: callTrades.map(t => t.id),
          description: `${actionType.replace('_', ' ')} for ${callTrades.length} CALL trades based on bearish technical signal`,
          parameters: {
            signalStrength: highestConfidenceSignal.strength,
            signalDescription: highestConfidenceSignal.description
          },
          previousRisk: 1.0,
          newRisk: 1.0 - riskReduction,
          userRiskTolerance: currentRiskTolerance
        });
      }
    }
    
    // For PUT trades, we might want to take profit if they're profitable
    const profitablePutTrades = currentTrades.filter(t => 
      t.status === 'active' && 
      t.type === 'PUT' && 
      t.currentPrice > t.entryPrice
    );
    
    if (profitablePutTrades.length > 0 && highestConfidenceSignal.strength === 'strong') {
      actions.push({
        id: uuidv4(),
        signalId: highestConfidenceSignal.id,
        timestamp: new Date(),
        actionType: 'adjust_take_profit',
        tradeIds: profitablePutTrades.map(t => t.id),
        description: `Adjust take profit for ${profitablePutTrades.length} profitable PUT trades based on bearish technical signal`,
        parameters: {
          signalStrength: highestConfidenceSignal.strength,
          signalDescription: highestConfidenceSignal.description,
          adjustmentFactor: 0.8 // Tighten take profit to 80% of original target
        },
        previousRisk: 1.0,
        newRisk: 1.0,
        userRiskTolerance: currentRiskTolerance
      });
    }
  }
  
  // Process bullish signals
  if (bullishSignals.length > 0) {
    // Sort by confidence
    const sortedSignals = [...bullishSignals].sort((a, b) => b.confidence - a.confidence);
    const highestConfidenceSignal = sortedSignals[0];
    
    // Find PUT trades that might be at risk
    const putTrades = currentTrades.filter(t => 
      t.status === 'active' && t.type === 'PUT'
    );
    
    if (putTrades.length > 0) {
      // Determine action based on signal strength and risk tolerance
      let actionType: RiskActionType = 'no_action';
      let riskReduction = 0;
      
      switch (highestConfidenceSignal.strength) {
        case 'extreme':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'exit_trade' 
            : 'reduce_position_size';
          riskReduction = 0.7;
          break;
        case 'strong':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'reduce_position_size' 
            : currentRiskTolerance === 'moderate'
              ? 'adjust_stop_loss'
              : 'no_action';
          riskReduction = 0.5;
          break;
        case 'moderate':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'adjust_stop_loss' 
            : 'no_action';
          riskReduction = 0.3;
          break;
        case 'weak':
          actionType = currentRiskTolerance === 'conservative' 
            ? 'adjust_stop_loss' 
            : 'no_action';
          riskReduction = 0.1;
          break;
      }
      
      if (actionType !== 'no_action') {
        actions.push({
          id: uuidv4(),
          signalId: highestConfidenceSignal.id,
          timestamp: new Date(),
          actionType,
          tradeIds: putTrades.map(t => t.id),
          description: `${actionType.replace('_', ' ')} for ${putTrades.length} PUT trades based on bullish technical signal`,
          parameters: {
            signalStrength: highestConfidenceSignal.strength,
            signalDescription: highestConfidenceSignal.description
          },
          previousRisk: 1.0,
          newRisk: 1.0 - riskReduction,
          userRiskTolerance: currentRiskTolerance
        });
      }
    }
    
    // For CALL trades, we might want to take profit if they're profitable
    const profitableCallTrades = currentTrades.filter(t => 
      t.status === 'active' && 
      t.type === 'CALL' && 
      t.currentPrice > t.entryPrice
    );
    
    if (profitableCallTrades.length > 0 && highestConfidenceSignal.strength === 'strong') {
      actions.push({
        id: uuidv4(),
        signalId: highestConfidenceSignal.id,
        timestamp: new Date(),
        actionType: 'adjust_take_profit',
        tradeIds: profitableCallTrades.map(t => t.id),
        description: `Adjust take profit for ${profitableCallTrades.length} profitable CALL trades based on bullish technical signal`,
        parameters: {
          signalStrength: highestConfidenceSignal.strength,
          signalDescription: highestConfidenceSignal.description,
          adjustmentFactor: 0.8 // Tighten take profit to 80% of original target
        },
        previousRisk: 1.0,
        newRisk: 1.0,
        userRiskTolerance: currentRiskTolerance
      });
    }
  }
}

/**
 * Process volatility signals
 */
function processVolatilitySignals(
  groupedSignals: Record<string, RiskSignal[]>,
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType,
  actions: RiskAction[]
): void {
  // Get bearish volatility signals (high or increasing volatility)
  const bearishVolatilitySignals = groupedSignals['volatility_bearish'] || [];
  
  if (bearishVolatilitySignals.length > 0 && settings.autoAdjustVolatility) {
    // Sort by confidence
    const sortedSignals = [...bearishVolatilitySignals].sort((a, b) => b.confidence - a.confidence);
    const highestConfidenceSignal = sortedSignals[0];
    
    // Find active trades
    const activeTrades = currentTrades.filter(t => t.status === 'active');
    
    if (activeTrades.length > 0) {
      let actionType: RiskActionType = 'no_action';
      
      // Determine action based on signal strength and risk tolerance
      if (highestConfidenceSignal.strength === 'extreme') {
        actionType = currentRiskTolerance === 'aggressive' 
          ? 'hedge_position' 
          : 'exit_trade';
      } else if (highestConfidenceSignal.strength === 'strong') {
        actionType = currentRiskTolerance === 'conservative' 
          ? 'exit_trade' 
          : currentRiskTolerance === 'moderate'
            ? 'hedge_position'
            : 'reduce_position_size';
      } else if (highestConfidenceSignal.strength === 'moderate') {
        actionType = currentRiskTolerance === 'conservative' 
          ? 'hedge_position' 
          : 'adjust_stop_loss';
      }
      
      if (actionType !== 'no_action') {
        actions.push({
          id: uuidv4(),
          signalId: highestConfidenceSignal.id,
          timestamp: new Date(),
          actionType,
          tradeIds: activeTrades.map(t => t.id),
          description: `${actionType.replace('_', ' ')} for ${activeTrades.length} active trades based on high volatility`,
          parameters: {
            signalStrength: highestConfidenceSignal.strength,
            signalDescription: highestConfidenceSignal.description,
            vix: highestConfidenceSignal.dataPoints?.vix
          },
          previousRisk: 1.0,
          newRisk: 0.5,
          userRiskTolerance: currentRiskTolerance
        });
      }
    }
  }
}

/**
 * Process economic signals
 */
function processEconomicSignals(
  groupedSignals: Record<string, RiskSignal[]>,
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType,
  actions: RiskAction[]
): void {
  // Economic signals processing would go here
  // This is a placeholder for demonstration
}

/**
 * Process sentiment signals
 */
function processSentimentSignals(
  groupedSignals: Record<string, RiskSignal[]>,
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType,
  actions: RiskAction[]
): void {
  // Sentiment signals processing would go here
  // This is a placeholder for demonstration
}

/**
 * Apply reduce position size action
 */
function applyReducePositionSize(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[]
): void {
  for (const trade of trades) {
    const reductionFactor = action.parameters.reductionFactor || 0.5;
    const newQuantity = Math.max(1, Math.floor(trade.quantity * reductionFactor));
    
    if (newQuantity < trade.quantity) {
      // Create a new closed trade for the reduced portion
      const reducedQuantity = trade.quantity - newQuantity;
      
      const closedTrade: SpyTrade = {
        ...trade,
        id: `${trade.id}-closed-${Date.now()}`,
        quantity: reducedQuantity,
        status: 'closed',
        closedAt: new Date(),
        profit: (trade.currentPrice - trade.entryPrice) * reducedQuantity * 100,
        profitPercentage: ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100
      };
      
      allTrades.push(closedTrade);
      
      // Update the original trade
      trade.quantity = newQuantity;
    }
  }
}

/**
 * Apply increase position size action
 */
function applyIncreasePositionSize(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[],
  availableOptions: SpyOption[]
): void {
  for (const trade of trades) {
    const increaseFactor = action.parameters.increaseFactor || 1.5;
    const addedQuantity = Math.floor(trade.quantity * (increaseFactor - 1));
    
    if (addedQuantity > 0) {
      // Update the original trade quantity
      trade.quantity += addedQuantity;
      
      // In a real implementation, we would need to check available capital
      // and update the average entry price
    }
  }
}

/**
 * Apply exit trade action
 */
function applyExitTrade(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[]
): void {
  for (const trade of trades) {
    trade.status = 'closed';
    trade.closedAt = new Date();
    trade.profit = (trade.currentPrice - trade.entryPrice) * trade.quantity * 100;
    trade.profitPercentage = ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
  }
}

/**
 * Apply hedge position action
 */
function applyHedgePosition(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[],
  availableOptions: SpyOption[],
  settings: AITradingSettings
): void {
  for (const trade of trades) {
    // Find a suitable hedge option
    const oppositeType = trade.type === 'CALL' ? 'PUT' : 'CALL';
    
    const hedgeOptions = availableOptions.filter(option => 
      option.type === oppositeType &&
      option.expirationDate.getTime() === trade.expirationDate.getTime()
    );
    
    if (hedgeOptions.length === 0) continue;
    
    // Choose a hedge option (in a real implementation, this would be more sophisticated)
    // Here we just pick the option with strike price closest to current
    const hedgeOption = hedgeOptions.sort((a, b) => 
      Math.abs(a.strikePrice - trade.strikePrice) - Math.abs(b.strikePrice - trade.strikePrice)
    )[0];
    
    // Create a new hedge trade
    const hedgeTrade: SpyTrade = {
      id: `hedge-${trade.id}-${Date.now()}`,
      optionId: hedgeOption.id,
      type: hedgeOption.type,
      strikePrice: hedgeOption.strikePrice,
      expirationDate: new Date(hedgeOption.expirationDate),
      entryPrice: hedgeOption.premium,
      currentPrice: hedgeOption.premium,
      targetPrice: hedgeOption.premium * 1.3, // Simple target
      stopLoss: hedgeOption.premium * 0.7, // Simple stop loss
      quantity: Math.max(1, Math.floor(trade.quantity * 0.5)), // Hedge with 50% of original position
      status: 'active',
      openedAt: new Date(),
      profit: 0,
      profitPercentage: 0,
      confidenceScore: 0.6
    };
    
    allTrades.push(hedgeTrade);
  }
}

/**
 * Apply adjust stop loss action
 */
function applyAdjustStopLoss(
  trades: SpyTrade[],
  action: RiskAction
): void {
  for (const trade of trades) {
    const adjustmentFactor = action.parameters.adjustmentFactor || 0.7;
    
    // For bearish signals on CALL options or bullish signals on PUT options,
    // move stop loss closer to current price
    if ((trade.type === 'CALL' && action.parameters.signalDirection === 'bearish') ||
        (trade.type === 'PUT' && action.parameters.signalDirection === 'bullish')) {
      
      // Calculate new stop loss
      const currentGap = trade.currentPrice - trade.stopLoss;
      const newGap = currentGap * adjustmentFactor;
      trade.stopLoss = trade.currentPrice - newGap;
    }
  }
}

/**
 * Apply adjust take profit action
 */
function applyAdjustTakeProfit(
  trades: SpyTrade[],
  action: RiskAction
): void {
  for (const trade of trades) {
    const adjustmentFactor = action.parameters.adjustmentFactor || 0.8;
    
    // For bullish signals on CALL options or bearish signals on PUT options,
    // tighten take profit level to lock in gains
    if ((trade.type === 'CALL' && action.parameters.signalDirection === 'bullish') ||
        (trade.type === 'PUT' && action.parameters.signalDirection === 'bearish')) {
      
      // If trade is profitable, move take profit closer to current price
      if (trade.currentPrice > trade.entryPrice) {
        const currentTarget = trade.targetPrice;
        const newTarget = trade.currentPrice + (currentTarget - trade.currentPrice) * adjustmentFactor;
        trade.targetPrice = newTarget;
      }
    }
  }
}

/**
 * Apply convert to spread action
 */
function applyConvertToSpread(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[],
  availableOptions: SpyOption[]
): void {
  // Implementing a spread conversion is beyond the scope of this example
  // This would involve adding a short leg to create a vertical spread
  // This is just a placeholder for demonstration
}

/**
 * Group actions by signal pattern for learning
 */
function groupActionsBySignalPattern(
  actions: RiskAction[]
): Record<string, RiskAction[]> {
  const groupedActions: Record<string, RiskAction[]> = {};
  
  for (const action of actions) {
    // Find the corresponding signal
    const signal = monitoringLog.signals.find(s => s.id === action.signalId);
    if (!signal) continue;
    
    const patternKey = `${signal.source}|${signal.condition}|${signal.strength}|${signal.direction}`;
    
    if (!groupedActions[patternKey]) {
      groupedActions[patternKey] = [];
    }
    
    groupedActions[patternKey].push(action);
  }
  
  return groupedActions;
}

/**
 * Calculate confidence level for a learning insight
 */
function calculateInsightConfidence(sampleSize: number, successRate: number): number {
  // Simple confidence calculation based on sample size and success rate
  // In a real implementation, this would be more sophisticated
  const sampleSizeFactor = Math.min(1, sampleSize / 20); // Max out at 20 samples
  return sampleSizeFactor * (0.5 + successRate / 2);
}

/**
 * Calculate a simplified RSI
 */
function calculateSimplifiedRSI(data: SpyMarketData[]): number {
  if (data.length < 15) return 50;
  
  const prices = data.map(d => d.price);
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  // Use the last 14 values
  const last14Gains = gains.slice(-14);
  const last14Losses = losses.slice(-14);
  
  const avgGain = last14Gains.reduce((sum, val) => sum + val, 0) / 14;
  const avgLoss = last14Losses.reduce((sum, val) => sum + val, 0) / 14;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}
