
import { v4 as uuidv4 } from 'uuid';
import { 
  RiskSignal, 
  RiskAction,
  RiskActionType,
  LearningInsight,
  RiskSignalSource,
  RiskSignalStrength,
  RiskSignalDirection,
  RiskMonitoringLog,
  RiskSignalCondition
} from '@/lib/types/spy/riskMonitoring';
import { 
  SpyTrade,
  MarketCondition,
  RiskToleranceType
} from '@/lib/types/spy';

/**
 * Learn from past risk actions and their outcomes
 */
export function learnFromOutcomes(
  completedTrades: SpyTrade[],
  historicalActions: RiskAction[],
  monitoringLog: RiskMonitoringLog
): LearningInsight[] {
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
  const actionsByPattern = groupActionsBySignalPattern(relevantActions, monitoringLog);
  
  // Generate insights
  const insights: LearningInsight[] = [];
  
  for (const [patternKey, actions] of Object.entries(actionsByPattern)) {
    const [source, condition, strength, direction] = patternKey.split('|') as [
      RiskSignalSource, 
      RiskSignalCondition,
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
      if (!actionTypeCounts[action.type]) {
        actionTypeCounts[action.type] = { count: 0, profit: 0 };
      }
      
      actionTypeCounts[action.type].count++;
      actionTypeCounts[action.type].profit += action.profitImpact || 0;
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
      actionTaken: recommendedActions[0] || 'no_action',
      successRate,
      profitImpact: averageProfitImpact,
      appliedCount: actions.length,
      relatedRiskTolerance: actions[0]?.userRiskTolerance || 'moderate',
      confidence: calculateInsightConfidence(actions.length, successRate),
      recommendedActions: recommendedActions.slice(0, 3), // Top 3 recommendations
      averageProfitImpact
    };
    
    insights.push(insight);
  }
  
  return insights;
}

/**
 * Get recommended actions for a specific signal based on learned insights
 */
export function getRecommendedActions(
  signal: RiskSignal,
  insights: LearningInsight[]
): RiskActionType[] {
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
}

/**
 * Group actions by signal pattern for learning
 */
export function groupActionsBySignalPattern(
  actions: RiskAction[],
  monitoringLog: RiskMonitoringLog
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
export function calculateInsightConfidence(sampleSize: number, successRate: number): number {
  // Simple confidence calculation based on sample size and success rate
  // In a real implementation, this would be more sophisticated
  const sampleSizeFactor = Math.min(1, sampleSize / 20); // Max out at 20 samples
  return sampleSizeFactor * (0.5 + successRate / 2);
}
