
import { useState, useEffect } from 'react';
import { 
  TradingStrategy, 
  SpyTrade,
  SpyMarketData,
  RiskToleranceType
} from '@/lib/types/spy';
import { 
  analyzeStrategyPerformance,
  generateStrategySuggestions,
  detectMarketPatterns,
  applyStrategySuggestion,
  StrategySuggestion,
  MarketPattern
} from '@/services/strategyLearning/strategyLearningService';
import { getSpyTrades, getSpyMarketData } from '@/services/spyOptionsService';

interface UseStrategyLearningProps {
  strategies: TradingStrategy[];
  riskTolerance: RiskToleranceType;
}

export const useStrategyLearning = ({ strategies, riskTolerance }: UseStrategyLearningProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<StrategySuggestion[]>([]);
  const [marketPatterns, setMarketPatterns] = useState<MarketPattern[]>([]);
  const [completedTrades, setCompletedTrades] = useState<SpyTrade[]>([]);
  const [marketData, setMarketData] = useState<SpyMarketData[]>([]);

  // Load data and analyze strategies
  useEffect(() => {
    const loadDataAndAnalyze = async () => {
      setIsLoading(true);
      try {
        // Get completed trades and market data
        const trades = await getSpyTrades();
        const market = await getSpyMarketData();
        
        // Filter for completed trades only
        const completed = trades.filter(trade => trade.status === 'closed');
        
        setCompletedTrades(completed);
        setMarketData(Array.isArray(market) ? market : [market]);
        
        // If we have strategies and data, analyze them
        if (strategies.length > 0 && completed.length > 0) {
          const allSuggestions: StrategySuggestion[] = [];
          
          // Analyze each strategy
          for (const strategy of strategies) {
            const performance = analyzeStrategyPerformance(strategy, completed, Array.isArray(market) ? market : [market]);
            const strategySuggestions = generateStrategySuggestions(strategy, performance, Array.isArray(market) ? market : [market], riskTolerance);
            allSuggestions.push(...strategySuggestions);
          }
          
          // Detect market patterns
          const patterns = detectMarketPatterns(Array.isArray(market) ? market : [market], completed);
          
          setSuggestions(allSuggestions);
          setMarketPatterns(patterns);
        }
      } catch (error) {
        console.error('Error in strategy learning analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDataAndAnalyze();
  }, [strategies, riskTolerance]);
  
  // Apply a suggestion to a strategy
  const applySuggestion = (suggestion: StrategySuggestion, strategy: TradingStrategy): TradingStrategy => {
    return applyStrategySuggestion(strategy, suggestion);
  };
  
  // Get suggestions for a specific strategy
  const getSuggestionsForStrategy = (strategyId: string): StrategySuggestion[] => {
    return suggestions.filter(s => s.strategyId === strategyId);
  };
  
  // Sort suggestions by confidence
  const getSortedSuggestions = (): StrategySuggestion[] => {
    return [...suggestions].sort((a, b) => b.confidenceScore - a.confidenceScore);
  };
  
  // Get best performing strategy for a market pattern
  const getBestStrategyForPattern = (pattern: string): { strategyId: string, confidence: number } | null => {
    const matchingPattern = marketPatterns.find(p => p.pattern === pattern);
    
    if (!matchingPattern || matchingPattern.strategiesPerformance.length === 0) {
      return null;
    }
    
    // Sort by profit factor and win rate
    const sorted = [...matchingPattern.strategiesPerformance]
      .filter(s => s.sampleSize >= 3) // Need at least 3 samples
      .sort((a, b) => {
        // Weight profit factor 60%, win rate 40%
        const scoreA = (a.profitFactor * 0.6) + (a.winRate * 0.4);
        const scoreB = (b.profitFactor * 0.6) + (b.winRate * 0.4);
        return scoreB - scoreA;
      });
    
    if (sorted.length === 0) {
      return null;
    }
    
    return {
      strategyId: sorted[0].strategyId,
      confidence: matchingPattern.confidenceScore
    };
  };
  
  // Get current market patterns detected
  const getCurrentMarketPatterns = (): MarketPattern[] => {
    return marketPatterns;
  };
  
  return {
    isLoading,
    suggestions,
    marketPatterns,
    getSuggestionsForStrategy,
    getSortedSuggestions,
    getBestStrategyForPattern,
    getCurrentMarketPatterns,
    applySuggestion
  };
};
