
import { v4 as uuidv4 } from 'uuid';
import { 
  RiskSignal,
  RiskAction,
  RiskMonitoringLog,
  LearningInsight,
  RiskSignalSource,
  RiskSignalStrength,
  RiskActionType,
  MarketRiskProfile,
  RiskSignalDirection
} from './types';
import { 
  AITradingSettings, 
  SpyMarketData, 
  SpyTrade,
  SpyOption,
  MarketCondition,
  RiskToleranceType
} from '@/lib/types/spy';

import { detectSignals } from './signalDetection';
import { determineActions } from './actionDetermination';
import { applyActions } from './actionApplication';
import { learnFromOutcomes, getRecommendedActions } from './learningService';
import { analyzeMarketCondition } from './marketAnalysis';

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
  // Get market profile
  const currentMarketProfile = analyzeMarketCondition(marketData, historicalMarketData);
  
  // Detect signals using the dedicated module
  const signals = detectSignals(
    marketData, 
    historicalMarketData, 
    currentTrades, 
    settings, 
    currentMarketProfile
  );
  
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
  if (signals.length === 0 || currentTrades.length === 0) {
    return [];
  }
  
  // Determine actions using the dedicated module
  const actions = determineActions(
    signals,
    currentTrades,
    settings,
    currentRiskTolerance
  );
  
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
  // Apply actions using the dedicated module
  return applyActions(actions, currentTrades, availableOptions, settings);
};

/**
 * Learn from past risk actions and their outcomes
 */
export const learnFromRiskActionOutcomes = (
  completedTrades: SpyTrade[],
  historicalActions: RiskAction[]
): LearningInsight[] => {
  // Use the learning service module
  const insights = learnFromOutcomes(completedTrades, historicalActions, monitoringLog);
  
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
  return getRecommendedActions(signal, insights);
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
