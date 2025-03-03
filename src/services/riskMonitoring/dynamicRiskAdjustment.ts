
import { 
  TradingStrategy, 
  AITradingSettings, 
  RiskToleranceType,
  SpyMarketData,
  MarketCondition
} from '@/lib/types/spy';
import { 
  RiskSignal,
  MarketRiskProfile
} from '@/lib/types/spy/riskMonitoring';
import { MarketPattern } from '@/services/strategyLearning/strategyLearningService';

/**
 * Dynamic risk adjustment parameters
 */
export interface RiskAdjustmentFactors {
  positionSizeAdjustment: number; // Multiplier for position size (1 = no change, 0.5 = half size, etc)
  stopLossAdjustment: number;     // Multiplier for stop loss (1 = no change, 0.9 = tighter stops, etc)
  takeProfitAdjustment: number;   // Multiplier for take profit (1 = no change, 1.2 = wider targets, etc)
  deltaPreferenceShift: number;   // Shift in delta preference (-0.1 to 0.1)
  strategyPreference: string[];   // Ordered list of preferred strategy IDs
  skipTradeRecommendation: boolean; // Whether to skip this trade opportunity
  hedgingRecommendation: boolean; // Whether to add a hedge
  confidence: number;            // Confidence in these recommendations (0-1)
  reasonsForAdjustment: string[]; // Explanation for adjustments
}

/**
 * Calculate dynamic risk adjustment factors based on current market conditions,
 * recent signals, detected patterns, and user settings
 */
export function calculateDynamicRiskAdjustments(
  settings: AITradingSettings,
  marketProfile: MarketRiskProfile, 
  recentSignals: RiskSignal[],
  marketPatterns: MarketPattern[],
  availableStrategies: TradingStrategy[],
  currentRiskTolerance: RiskToleranceType,
  volatilityIndex: number
): RiskAdjustmentFactors {
  // Start with default adjustments (no change)
  const adjustments: RiskAdjustmentFactors = {
    positionSizeAdjustment: 1,
    stopLossAdjustment: 1,
    takeProfitAdjustment: 1,
    deltaPreferenceShift: 0,
    strategyPreference: [],
    skipTradeRecommendation: false,
    hedgingRecommendation: false,
    confidence: 0.5,
    reasonsForAdjustment: []
  };

  // Volatility Adjustment Factor
  // Higher VIX = reduce position size
  if (volatilityIndex > settings.volatilityThreshold) {
    const volAdjustment = Math.max(0.5, 1 - ((volatilityIndex - settings.volatilityThreshold) / 50));
    adjustments.positionSizeAdjustment *= volAdjustment;
    adjustments.stopLossAdjustment *= 0.9; // Tighter stops in high volatility
    adjustments.reasonsForAdjustment.push(`VIX at ${volatilityIndex} exceeds threshold of ${settings.volatilityThreshold}`);
  }

  // Market Condition Adjustments
  // Apply market condition overrides from user settings
  const conditionOverride = settings.marketConditionOverrides[marketProfile.currentCondition];
  if (conditionOverride && conditionOverride.enabled) {
    adjustments.positionSizeAdjustment *= conditionOverride.adjustedRisk;
    if (conditionOverride.adjustedRisk < 0.8) {
      adjustments.stopLossAdjustment *= 0.9; // Tighter stops when risk is reduced
    }
    adjustments.reasonsForAdjustment.push(`${marketProfile.currentCondition} market condition (user preference)`);
  }

  // Risk Tolerance Adjustments
  // Conservative = smaller size, tighter take profit
  // Aggressive = larger size, wider take profit
  if (currentRiskTolerance === 'conservative') {
    adjustments.positionSizeAdjustment *= 0.8;
    adjustments.takeProfitAdjustment *= 0.9;
    adjustments.deltaPreferenceShift = -0.05; // Prefer higher delta options
    adjustments.reasonsForAdjustment.push('Conservative risk profile');
  } else if (currentRiskTolerance === 'aggressive') {
    adjustments.positionSizeAdjustment *= 1.2;
    adjustments.takeProfitAdjustment *= 1.1;
    adjustments.deltaPreferenceShift = 0.05; // Can use lower delta options
    adjustments.reasonsForAdjustment.push('Aggressive risk profile');
  }

  // Recent Signal Adjustments
  // If we have high strength bearish signals in last 24 hours, reduce risk
  const recentBearishSignals = recentSignals.filter(signal => {
    const age = Date.now() - new Date(signal.timestamp).getTime();
    const ageInHours = age / (1000 * 60 * 60);
    return ageInHours <= 24 && signal.direction === 'bearish' && 
           (signal.strength === 'strong' || signal.strength === 'extreme');
  });

  if (recentBearishSignals.length >= 2) {
    adjustments.positionSizeAdjustment *= 0.7;
    adjustments.hedgingRecommendation = true;
    adjustments.reasonsForAdjustment.push(`${recentBearishSignals.length} strong bearish signals in last 24 hours`);
  }

  // Market Pattern Strategy Selection
  // Select strategies that perform well in current market patterns
  if (marketPatterns.length > 0 && availableStrategies.length > 0) {
    const patternStrategyMatches: Array<{strategyId: string, confidence: number}> = [];
    
    marketPatterns.forEach(pattern => {
      // Find best-performing strategies for this pattern
      const bestPerformers = pattern.strategiesPerformance
        .filter(p => p.sampleSize >= 5) // Need sufficient sample size
        .sort((a, b) => {
          // Weight profit factor 60%, win rate 40%
          const scoreA = (a.profitFactor * 0.6) + (a.winRate * 0.4);
          const scoreB = (b.profitFactor * 0.6) + (b.winRate * 0.4);
          return scoreB - scoreA;
        })
        .slice(0, 3); // Top 3 performers
      
      bestPerformers.forEach(performer => {
        patternStrategyMatches.push({
          strategyId: performer.strategyId,
          confidence: pattern.confidenceScore * (performer.profitFactor / (performer.profitFactor + 1))
        });
      });

      adjustments.reasonsForAdjustment.push(`${pattern.pattern} pattern detected`);
    });
    
    // Group by strategy and calculate average confidence
    const strategyConfidence: Record<string, {sum: number, count: number}> = {};
    patternStrategyMatches.forEach(match => {
      if (!strategyConfidence[match.strategyId]) {
        strategyConfidence[match.strategyId] = {sum: 0, count: 0};
      }
      strategyConfidence[match.strategyId].sum += match.confidence;
      strategyConfidence[match.strategyId].count += 1;
    });
    
    // Sort strategies by confidence
    const rankedStrategies = Object.entries(strategyConfidence)
      .map(([id, {sum, count}]) => ({
        id,
        avgConfidence: sum / count
      }))
      .sort((a, b) => b.avgConfidence - a.avgConfidence);
    
    // Set strategy preference
    adjustments.strategyPreference = rankedStrategies.map(s => s.id);
    
    // Only set confidence if we have meaningful data
    if (rankedStrategies.length > 0) {
      adjustments.confidence = Math.min(0.9, 0.6 + (rankedStrategies[0].avgConfidence * 0.3));
    }
  } else {
    // Without pattern data, rank by general performance
    const activeStrategies = availableStrategies.filter(s => s.isActive);
    adjustments.strategyPreference = activeStrategies
      .sort((a, b) => b.successRate - a.successRate)
      .map(s => s.id);
  }

  // Market Risk Profile Adjustments
  if (marketProfile.compositeRiskScore > 0.7) {
    adjustments.positionSizeAdjustment *= 0.8;
    adjustments.skipTradeRecommendation = marketProfile.compositeRiskScore > 0.85;
    adjustments.reasonsForAdjustment.push(`High composite risk score: ${(marketProfile.compositeRiskScore * 100).toFixed(1)}%`);
  }

  // Key Risk Factors Adjustments
  marketProfile.keyRiskFactors.forEach(factor => {
    if (factor.impact > 0.7) {
      adjustments.positionSizeAdjustment *= Math.max(0.7, 1 - (factor.impact * 0.3));
      adjustments.reasonsForAdjustment.push(`${factor.source} risk factor: ${factor.description}`);
    }
  });

  // Make sure position adjustment doesn't go below 0.3 (30% of normal)
  adjustments.positionSizeAdjustment = Math.max(0.3, adjustments.positionSizeAdjustment);
  
  return adjustments;
}

/**
 * Apply risk adjustments to a trading strategy
 */
export function applyRiskAdjustmentsToStrategy(
  strategy: TradingStrategy,
  adjustments: RiskAdjustmentFactors
): TradingStrategy {
  const adjustedStrategy = { ...strategy };
  
  // Adjust position size
  adjustedStrategy.maxPositionSize = Math.round(strategy.maxPositionSize * adjustments.positionSizeAdjustment);
  
  // Adjust stop loss
  adjustedStrategy.maxLossPerTrade = Math.round(strategy.maxLossPerTrade * adjustments.stopLossAdjustment);
  
  // Adjust take profit
  adjustedStrategy.profitTarget = strategy.profitTarget * adjustments.takeProfitAdjustment;
  
  // Adjust delta range
  const [minDelta, maxDelta] = strategy.deltaRange;
  adjustedStrategy.deltaRange = [
    Math.max(0.05, minDelta + adjustments.deltaPreferenceShift),
    Math.min(0.95, maxDelta + adjustments.deltaPreferenceShift)
  ];
  
  return adjustedStrategy;
}

/**
 * Get the optimal strategy for current market conditions
 */
export function getOptimalStrategy(
  availableStrategies: TradingStrategy[],
  adjustments: RiskAdjustmentFactors,
  marketCondition: MarketCondition
): TradingStrategy | null {
  if (availableStrategies.length === 0) {
    return null;
  }
  
  // If we have strategy preferences from risk adjustments
  if (adjustments.strategyPreference.length > 0) {
    for (const strategyId of adjustments.strategyPreference) {
      const strategy = availableStrategies.find(s => s.id === strategyId && s.isActive);
      if (strategy) {
        // Strategy should match current market condition for optimal results
        if (strategy.marketCondition === marketCondition) {
          return applyRiskAdjustmentsToStrategy(strategy, adjustments);
        }
      }
    }
  }
  
  // Fallback: find first active strategy that matches current market condition
  const matchingStrategy = availableStrategies.find(
    s => s.isActive && s.marketCondition === marketCondition
  );
  
  if (matchingStrategy) {
    return applyRiskAdjustmentsToStrategy(matchingStrategy, adjustments);
  }
  
  // Last resort: use any active strategy
  const anyActiveStrategy = availableStrategies.find(s => s.isActive);
  
  if (anyActiveStrategy) {
    return applyRiskAdjustmentsToStrategy(anyActiveStrategy, adjustments);
  }
  
  return null;
}
