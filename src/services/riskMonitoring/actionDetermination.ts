
import { v4 as uuidv4 } from 'uuid';
import { 
  RiskSignal, 
  RiskAction,
  RiskActionType 
} from './types';
import { 
  AITradingSettings, 
  SpyTrade,
  RiskToleranceType
} from '@/lib/types/spy';
import { groupSignalsBySourceAndDirection } from './signalDetection';

/**
 * Determine appropriate risk actions based on detected signals and user risk tolerance
 */
export function determineActions(
  signals: RiskSignal[],
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType
): RiskAction[] {
  const actions: RiskAction[] = [];
  
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
  
  return actions;
}

/**
 * Process technical signals
 */
export function processTechnicalSignals(
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
export function processVolatilitySignals(
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
export function processEconomicSignals(
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
export function processSentimentSignals(
  groupedSignals: Record<string, RiskSignal[]>,
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType,
  actions: RiskAction[]
): void {
  // Sentiment signals processing would go here
  // This is a placeholder for demonstration
}
