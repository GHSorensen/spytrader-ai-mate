
import { useState, useEffect } from 'react';
import { 
  RiskSignal, 
  RiskAction, 
  LearningInsight,
  MarketRiskProfile
} from '@/lib/types/spy/riskMonitoring';
import { getSpyMarketData, getSpyTrades, getSpyOptions } from '@/services/spyOptionsService';
import { 
  detectRiskSignals, 
  determineRiskActions,
  applyRiskActions,
  learnFromRiskActionOutcomes,
  getMonitoringLog
} from '@/services/riskMonitoringService';
import { AITradingSettings, RiskToleranceType, SpyTrade } from '@/lib/types/spy';

// Cache for historical market data
let historicalMarketDataCache: any[] = [];

export const useRiskMonitoring = (
  settings: AITradingSettings,
  currentRiskTolerance: RiskToleranceType
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [latestSignals, setLatestSignals] = useState<RiskSignal[]>([]);
  const [latestActions, setLatestActions] = useState<RiskAction[]>([]);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [currentRiskProfile, setCurrentRiskProfile] = useState<MarketRiskProfile | null>(null);
  const [activeTrades, setActiveTrades] = useState<SpyTrade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<SpyTrade[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch market data, trades and options
        const marketData = await getSpyMarketData();
        const trades = await getSpyTrades();
        
        // Add to historical data cache
        historicalMarketDataCache.push(marketData);
        
        // Set active and completed trades
        setActiveTrades(trades.filter(t => t.status === 'active'));
        setCompletedTrades(trades.filter(t => t.status !== 'active'));
        
        // Get monitoring log
        const log = getMonitoringLog();
        setLatestSignals(log.signals.slice(-10).reverse());
        setLatestActions(log.actions.slice(-10).reverse());
        setLearningInsights(log.learningInsights);
        
      } catch (error) {
        console.error('Error loading risk monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
    
    // Simulate risk monitoring updates
    const interval = setInterval(() => {
      if (autoMode) {
        performRiskMonitoring();
      }
    }, 30000); // Check every 30 seconds in auto mode
    
    return () => clearInterval(interval);
  }, [settings, autoMode]);
  
  // Perform manual risk monitoring scan
  const performRiskMonitoring = async () => {
    setIsLoading(true);
    
    try {
      // Fetch latest data
      const marketData = await getSpyMarketData();
      const trades = await getSpyTrades();
      const options = await getSpyOptions();
      
      // Add to historical data cache (limit to last 60 data points)
      historicalMarketDataCache.push(marketData);
      if (historicalMarketDataCache.length > 60) {
        historicalMarketDataCache = historicalMarketDataCache.slice(-60);
      }
      
      // Get active trades
      const activeTrades = trades.filter(t => t.status === 'active');
      setActiveTrades(activeTrades);
      
      // Detect risk signals
      const signals = detectRiskSignals(
        marketData,
        historicalMarketDataCache,
        activeTrades,
        settings
      );
      
      // Determine actions based on signals
      const actions = determineRiskActions(
        signals,
        activeTrades,
        settings,
        currentRiskTolerance
      );
      
      if (actions.length > 0) {
        // Apply actions to trades
        const updatedTrades = applyRiskActions(
          actions,
          activeTrades,
          options,
          settings
        );
        
        // Update trades list
        setActiveTrades(updatedTrades.filter(t => t.status === 'active'));
        setCompletedTrades([
          ...completedTrades,
          ...updatedTrades.filter(t => t.status !== 'active')
        ]);
      }
      
      // Update learning insights
      const insights = learnFromRiskActionOutcomes(
        completedTrades,
        actions
      );
      
      // Get the latest log data
      const log = getMonitoringLog();
      setLatestSignals(log.signals.slice(-10).reverse());
      setLatestActions(log.actions.slice(-10).reverse());
      setLearningInsights(log.learningInsights);
      
    } catch (error) {
      console.error('Error during risk monitoring:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle auto mode
  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
  };
  
  return {
    isLoading,
    latestSignals,
    latestActions,
    learningInsights,
    currentRiskProfile,
    activeTrades,
    completedTrades,
    autoMode,
    performRiskMonitoring,
    toggleAutoMode
  };
};
