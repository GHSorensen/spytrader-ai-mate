
import { v4 as uuidv4 } from 'uuid';
import { 
  TradingStrategy, 
  SpyTrade, 
  MarketCondition,
  OptionType,
  OptionExpiry,
  SpyMarketData
} from '@/lib/types/spy';
import { RiskToleranceType } from '@/lib/types/spy/common';

// Interface for strategy performance metrics
interface StrategyPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  averageHoldingPeriod: number;
  bestMarketCondition: MarketCondition | null;
  worstMarketCondition: MarketCondition | null;
}

// Interface for strategy learning suggestions
export interface StrategySuggestion {
  id: string;
  strategyId: string;
  timestamp: Date;
  type: 'parameter_change' | 'market_condition' | 'risk_level' | 'options_type' | 'expiry';
  parameterName?: string;
  currentValue: any;
  suggestedValue: any;
  confidenceScore: number;  // 0-1
  reasoning: string;
  expectedImprovement: {
    winRate?: number;
    profitFactor?: number;
    drawdown?: number;
  };
  appliedOn?: Date;
  appliedSuccessfully?: boolean;
}

// Interface for market pattern analysis
export interface MarketPattern {
  id: string;
  pattern: string;  // e.g., "VolatilityExpansion", "HigherLows", etc.
  indicators: {
    name: string;
    value: number;
    threshold: number;
  }[];
  condition: MarketCondition;
  confidenceScore: number;
  strategiesPerformance: {
    strategyId: string;
    winRate: number;
    profitFactor: number;
    sampleSize: number;
  }[];
  lastUpdated: Date;
}

/**
 * Analyze past trades by strategy to identify performance patterns
 */
export function analyzeStrategyPerformance(
  strategy: TradingStrategy,
  completedTrades: SpyTrade[],
  marketData: SpyMarketData[]
): StrategyPerformance {
  // Filter trades for the specific strategy
  const strategyTrades = completedTrades.filter(
    trade => trade.strategyId === strategy.id
  );
  
  if (strategyTrades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      averageProfit: 0,
      averageLoss: 0,
      profitFactor: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      averageHoldingPeriod: 0,
      bestMarketCondition: null,
      worstMarketCondition: null
    };
  }
  
  // Calculate winning and losing trades
  const winningTrades = strategyTrades.filter(trade => trade.profit > 0);
  const losingTrades = strategyTrades.filter(trade => trade.profit <= 0);
  
  // Calculate win rate
  const winRate = winningTrades.length / strategyTrades.length;
  
  // Calculate average profit and loss
  const averageProfit = winningTrades.length > 0 
    ? winningTrades.reduce((sum, trade) => sum + trade.profit, 0) / winningTrades.length 
    : 0;
    
  const averageLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0)) / losingTrades.length 
    : 0;
  
  // Calculate profit factor
  const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  
  // Calculate consecutive wins and losses
  let currentConsecutiveWins = 0;
  let maxConsecutiveWins = 0;
  let currentConsecutiveLosses = 0;
  let maxConsecutiveLosses = 0;
  
  // Sort trades by execution time
  const sortedTrades = [...strategyTrades].sort(
    (a, b) => new Date(a.executionTime).getTime() - new Date(b.executionTime).getTime()
  );
  
  sortedTrades.forEach(trade => {
    if (trade.profit > 0) {
      currentConsecutiveWins++;
      currentConsecutiveLosses = 0;
      if (currentConsecutiveWins > maxConsecutiveWins) {
        maxConsecutiveWins = currentConsecutiveWins;
      }
    } else {
      currentConsecutiveLosses++;
      currentConsecutiveWins = 0;
      if (currentConsecutiveLosses > maxConsecutiveLosses) {
        maxConsecutiveLosses = currentConsecutiveLosses;
      }
    }
  });
  
  // Calculate average holding period
  const totalHoldingDays = strategyTrades.reduce((sum, trade) => {
    const executionTime = new Date(trade.executionTime);
    const closingTime = new Date(trade.closingTime || Date.now());
    const holdingDays = (closingTime.getTime() - executionTime.getTime()) / (1000 * 60 * 60 * 24);
    return sum + holdingDays;
  }, 0);
  
  const averageHoldingPeriod = totalHoldingDays / strategyTrades.length;
  
  // Analyze performance by market condition
  const tradesByCondition: Record<MarketCondition, SpyTrade[]> = {
    'bullish': [],
    'bearish': [],
    'neutral': [],
    'volatile': []
  };
  
  strategyTrades.forEach(trade => {
    const condition = trade.marketCondition;
    if (condition) {
      tradesByCondition[condition].push(trade);
    }
  });
  
  // Calculate win rate by condition
  const winRateByCondition: Record<MarketCondition, number> = {} as any;
  
  Object.entries(tradesByCondition).forEach(([condition, trades]) => {
    if (trades.length > 0) {
      const wins = trades.filter(t => t.profit > 0).length;
      winRateByCondition[condition as MarketCondition] = wins / trades.length;
    }
  });
  
  // Find best and worst conditions
  let bestMarketCondition: MarketCondition | null = null;
  let worstMarketCondition: MarketCondition | null = null;
  let bestWinRate = 0;
  let worstWinRate = 1;
  
  Object.entries(winRateByCondition).forEach(([condition, rate]) => {
    // Need at least 5 trades to be meaningful
    if (tradesByCondition[condition as MarketCondition].length >= 5) {
      if (rate > bestWinRate) {
        bestWinRate = rate;
        bestMarketCondition = condition as MarketCondition;
      }
      
      if (rate < worstWinRate) {
        worstWinRate = rate;
        worstMarketCondition = condition as MarketCondition;
      }
    }
  });
  
  return {
    totalTrades: strategyTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    averageProfit,
    averageLoss,
    profitFactor,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    averageHoldingPeriod,
    bestMarketCondition,
    worstMarketCondition
  };
}

/**
 * Analyze a strategy and generate parameter improvement suggestions
 */
export function generateStrategySuggestions(
  strategy: TradingStrategy,
  performance: StrategyPerformance,
  marketData: SpyMarketData[],
  riskTolerance: RiskToleranceType
): StrategySuggestion[] {
  const suggestions: StrategySuggestion[] = [];
  
  // Only generate suggestions if we have enough data
  if (performance.totalTrades < 10) {
    return suggestions;
  }
  
  // Suggest market condition adjustments
  if (performance.bestMarketCondition && performance.worstMarketCondition) {
    // If strategy performs poorly in a specific market condition, suggest focusing on others
    if (performance.worstMarketCondition !== performance.bestMarketCondition && 
        strategy.marketCondition === performance.worstMarketCondition) {
      suggestions.push({
        id: uuidv4(),
        strategyId: strategy.id,
        timestamp: new Date(),
        type: 'market_condition',
        currentValue: strategy.marketCondition,
        suggestedValue: performance.bestMarketCondition,
        confidenceScore: Math.min(0.5 + performance.totalTrades / 100, 0.9),
        reasoning: `Strategy performs ${(performance.winRate * 100).toFixed(1)}% better in ${performance.bestMarketCondition} markets compared to ${performance.worstMarketCondition} markets.`,
        expectedImprovement: {
          winRate: performance.winRate * 0.2,
          profitFactor: performance.profitFactor * 0.15
        }
      });
    }
  }
  
  // Suggest risk level adjustments based on performance and user risk tolerance
  const riskMap = { 'conservative': 3, 'moderate': 5, 'aggressive': 8 };
  const idealRiskLevel = riskMap[riskTolerance];
  
  if (Math.abs(strategy.riskLevel - idealRiskLevel) > 2) {
    let suggestedRisk = idealRiskLevel;
    
    // If profitability is good but winrate is low, suggest slightly decreasing risk
    if (performance.profitFactor > 2 && performance.winRate < 0.4) {
      suggestedRisk = Math.max(idealRiskLevel - 1, 1);
    }
    
    // If profitability is poor but winrate is high, suggest slightly increasing risk
    if (performance.profitFactor < 1.3 && performance.winRate > 0.6) {
      suggestedRisk = Math.min(idealRiskLevel + 1, 10);
    }
    
    if (strategy.riskLevel !== suggestedRisk) {
      suggestions.push({
        id: uuidv4(),
        strategyId: strategy.id,
        timestamp: new Date(),
        type: 'risk_level',
        currentValue: strategy.riskLevel,
        suggestedValue: suggestedRisk,
        confidenceScore: 0.75,
        reasoning: `Align strategy risk level with your ${riskTolerance} risk tolerance profile for better consistency.`,
        expectedImprovement: {
          winRate: performance.winRate * 0.1,
          profitFactor: performance.profitFactor * 0.1
        }
      });
    }
  }
  
  // Suggest options expiry adjustments based on average holding period
  if (performance.averageHoldingPeriod > 0) {
    const currentExpiries = strategy.expiryPreference;
    let suggestedExpiries: OptionExpiry[] = [...currentExpiries];
    
    // If holding longer than 10 days but using short-term options
    if (performance.averageHoldingPeriod > 10 && !currentExpiries.includes('monthly')) {
      suggestedExpiries = ['monthly'];
      
      suggestions.push({
        id: uuidv4(),
        strategyId: strategy.id,
        timestamp: new Date(),
        type: 'expiry',
        currentValue: currentExpiries,
        suggestedValue: suggestedExpiries,
        confidenceScore: 0.8,
        reasoning: `Average holding period (${performance.averageHoldingPeriod.toFixed(1)} days) suggests better alignment with monthly options.`,
        expectedImprovement: {
          profitFactor: performance.profitFactor * 0.15
        }
      });
    }
    
    // If holding shorter than 3 days but using long-term options
    if (performance.averageHoldingPeriod < 3 && 
        (currentExpiries.includes('monthly') || currentExpiries.includes('quarterly'))) {
      suggestedExpiries = ['weekly'];
      
      suggestions.push({
        id: uuidv4(),
        strategyId: strategy.id,
        timestamp: new Date(),
        type: 'expiry',
        currentValue: currentExpiries,
        suggestedValue: suggestedExpiries,
        confidenceScore: 0.8,
        reasoning: `Short average holding period (${performance.averageHoldingPeriod.toFixed(1)} days) suggests better alignment with weekly options.`,
        expectedImprovement: {
          profitFactor: performance.profitFactor * 0.2
        }
      });
    }
  }
  
  // Suggest delta range adjustments based on win rate and profit factor
  // For poor performance, suggest moving closer to ATM
  if (performance.winRate < 0.4 && performance.profitFactor < 1.2) {
    const currentDelta = strategy.deltaRange;
    let suggestedDelta: [number, number] = [...currentDelta];
    
    // If using far OTM options, suggest moving closer to ATM
    if (strategy.optionType === 'call' && currentDelta[1] < 0.4) {
      suggestedDelta = [0.3, 0.5];
      
      suggestions.push({
        id: uuidv4(),
        strategyId: strategy.id,
        timestamp: new Date(),
        type: 'parameter_change',
        parameterName: 'deltaRange',
        currentValue: currentDelta,
        suggestedValue: suggestedDelta,
        confidenceScore: 0.7,
        reasoning: `Low win rate (${(performance.winRate * 100).toFixed(1)}%) suggests using higher delta options.`,
        expectedImprovement: {
          winRate: 0.1,
          profitFactor: 0.2
        }
      });
    } else if (strategy.optionType === 'put' && currentDelta[1] < 0.4) {
      suggestedDelta = [0.3, 0.5];
      
      suggestions.push({
        id: uuidv4(),
        strategyId: strategy.id,
        timestamp: new Date(),
        type: 'parameter_change',
        parameterName: 'deltaRange',
        currentValue: currentDelta,
        suggestedValue: suggestedDelta,
        confidenceScore: 0.7,
        reasoning: `Low win rate (${(performance.winRate * 100).toFixed(1)}%) suggests using higher delta options.`,
        expectedImprovement: {
          winRate: 0.1,
          profitFactor: 0.2
        }
      });
    }
  }
  
  return suggestions;
}

/**
 * Detect market patterns based on technical indicators
 */
export function detectMarketPatterns(
  marketData: SpyMarketData[],
  completedTrades: SpyTrade[]
): MarketPattern[] {
  const patterns: MarketPattern[] = [];
  
  // Need sufficient data
  if (marketData.length < 20) {
    return patterns;
  }
  
  // Sort market data by timestamp
  const sortedData = [...marketData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Check for volatility expansion pattern
  const recentVix = sortedData.slice(-5).map(d => d.vix);
  const prevVix = sortedData.slice(-10, -5).map(d => d.vix);
  
  const avgRecentVix = recentVix.reduce((sum, vix) => sum + vix, 0) / recentVix.length;
  const avgPrevVix = prevVix.reduce((sum, vix) => sum + vix, 0) / prevVix.length;
  
  if (avgRecentVix > avgPrevVix * 1.2) {
    // Volatility expansion detected
    // Analyze how strategies performed in past volatility expansions
    
    // Find previous volatility expansion periods
    const volExpansionPeriods: Date[] = [];
    
    for (let i = 10; i < sortedData.length; i++) {
      const recent5 = sortedData.slice(i-5, i).map(d => d.vix);
      const prev5 = sortedData.slice(i-10, i-5).map(d => d.vix);
      
      const avgRecent = recent5.reduce((sum, vix) => sum + vix, 0) / recent5.length;
      const avgPrev = prev5.reduce((sum, vix) => sum + vix, 0) / prev5.length;
      
      if (avgRecent > avgPrev * 1.2) {
        volExpansionPeriods.push(sortedData[i].timestamp);
      }
    }
    
    // Group trades by strategy during volatility expansion periods
    const tradesByStrategy: Record<string, SpyTrade[]> = {};
    
    completedTrades.forEach(trade => {
      if (trade.strategyId) {
        // Check if trade occurred during a volatility expansion period
        const tradeDate = new Date(trade.executionTime);
        
        // Look for volatility periods within 5 days of the trade
        const nearVolExpansion = volExpansionPeriods.some(date => {
          const timeDiff = Math.abs(date.getTime() - tradeDate.getTime());
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
          return daysDiff <= 5;
        });
        
        if (nearVolExpansion) {
          if (!tradesByStrategy[trade.strategyId]) {
            tradesByStrategy[trade.strategyId] = [];
          }
          
          tradesByStrategy[trade.strategyId].push(trade);
        }
      }
    });
    
    // Calculate performance metrics for each strategy during volatility expansion
    const strategyPerformance = Object.entries(tradesByStrategy).map(([strategyId, trades]) => {
      if (trades.length < 3) {
        return {
          strategyId,
          winRate: 0,
          profitFactor: 0,
          sampleSize: trades.length
        };
      }
      
      const winningTrades = trades.filter(t => t.profit > 0);
      const losingTrades = trades.filter(t => t.profit <= 0);
      
      const winRate = winningTrades.length / trades.length;
      
      const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
      const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
      
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
      
      return {
        strategyId,
        winRate,
        profitFactor,
        sampleSize: trades.length
      };
    });
    
    // Add the pattern if we have meaningful strategy performance data
    if (strategyPerformance.some(p => p.sampleSize >= 3)) {
      patterns.push({
        id: uuidv4(),
        pattern: 'VolatilityExpansion',
        indicators: [
          {
            name: 'VIX Increase',
            value: avgRecentVix / avgPrevVix,
            threshold: 1.2
          }
        ],
        condition: 'volatile',
        confidenceScore: Math.min(0.5 + strategyPerformance.reduce((sum, p) => sum + p.sampleSize, 0) / 50, 0.9),
        strategiesPerformance: strategyPerformance,
        lastUpdated: new Date()
      });
    }
  }
  
  // Check for trend strength pattern (using simple moving averages)
  const prices = sortedData.map(d => d.price);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  
  if (prices.length >= 50 && sma20 && sma50) {
    // Strong uptrend: price > SMA20 > SMA50
    if (prices[prices.length - 1] > sma20 && sma20 > sma50) {
      const strategyPerformance = analyzeStrategyPerformanceInPattern(
        completedTrades,
        sortedData,
        (data, i) => {
          if (i < 50) return false;
          const price = data[i].price;
          const sma20Value = calculateSMA(data.slice(0, i+1).map(d => d.price), 20);
          const sma50Value = calculateSMA(data.slice(0, i+1).map(d => d.price), 50);
          return price > sma20Value && sma20Value > sma50Value;
        }
      );
      
      if (strategyPerformance.some(p => p.sampleSize >= 3)) {
        patterns.push({
          id: uuidv4(),
          pattern: 'StrongUptrend',
          indicators: [
            {
              name: 'Price > SMA20 > SMA50',
              value: 1,
              threshold: 1
            }
          ],
          condition: 'bullish',
          confidenceScore: Math.min(0.5 + strategyPerformance.reduce((sum, p) => sum + p.sampleSize, 0) / 50, 0.9),
          strategiesPerformance: strategyPerformance,
          lastUpdated: new Date()
        });
      }
    }
    
    // Strong downtrend: price < SMA20 < SMA50
    if (prices[prices.length - 1] < sma20 && sma20 < sma50) {
      const strategyPerformance = analyzeStrategyPerformanceInPattern(
        completedTrades,
        sortedData,
        (data, i) => {
          if (i < 50) return false;
          const price = data[i].price;
          const sma20Value = calculateSMA(data.slice(0, i+1).map(d => d.price), 20);
          const sma50Value = calculateSMA(data.slice(0, i+1).map(d => d.price), 50);
          return price < sma20Value && sma20Value < sma50Value;
        }
      );
      
      if (strategyPerformance.some(p => p.sampleSize >= 3)) {
        patterns.push({
          id: uuidv4(),
          pattern: 'StrongDowntrend',
          indicators: [
            {
              name: 'Price < SMA20 < SMA50',
              value: 1,
              threshold: 1
            }
          ],
          condition: 'bearish',
          confidenceScore: Math.min(0.5 + strategyPerformance.reduce((sum, p) => sum + p.sampleSize, 0) / 50, 0.9),
          strategiesPerformance: strategyPerformance,
          lastUpdated: new Date()
        });
      }
    }
  }
  
  return patterns;
}

/**
 * Apply a suggestion to a strategy
 */
export function applyStrategySuggestion(
  strategy: TradingStrategy,
  suggestion: StrategySuggestion
): TradingStrategy {
  const updatedStrategy = { ...strategy };
  
  switch (suggestion.type) {
    case 'market_condition':
      updatedStrategy.marketCondition = suggestion.suggestedValue;
      break;
      
    case 'risk_level':
      updatedStrategy.riskLevel = suggestion.suggestedValue;
      break;
      
    case 'expiry':
      updatedStrategy.expiryPreference = suggestion.suggestedValue;
      break;
      
    case 'options_type':
      updatedStrategy.optionType = suggestion.suggestedValue;
      break;
      
    case 'parameter_change':
      if (suggestion.parameterName) {
        updatedStrategy[suggestion.parameterName] = suggestion.suggestedValue;
      }
      break;
  }
  
  return updatedStrategy;
}

// Helper function to calculate Simple Moving Average
function calculateSMA(data: number[], period: number): number | null {
  if (data.length < period) {
    return null;
  }
  
  const sum = data.slice(-period).reduce((sum, value) => sum + value, 0);
  return sum / period;
}

// Helper function to analyze how strategies performed during a specific pattern
function analyzeStrategyPerformanceInPattern(
  completedTrades: SpyTrade[],
  marketData: SpyMarketData[],
  patternDetectionFn: (data: SpyMarketData[], index: number) => boolean
): { strategyId: string; winRate: number; profitFactor: number; sampleSize: number }[] {
  // Find periods when the pattern occurred
  const patternPeriods: Date[] = [];
  
  for (let i = 0; i < marketData.length; i++) {
    if (patternDetectionFn(marketData, i)) {
      patternPeriods.push(marketData[i].timestamp);
    }
  }
  
  // Group trades by strategy during pattern periods
  const tradesByStrategy: Record<string, SpyTrade[]> = {};
  
  completedTrades.forEach(trade => {
    if (trade.strategyId) {
      // Check if trade occurred during a pattern period
      const tradeDate = new Date(trade.executionTime);
      
      // Look for pattern periods within 5 days of the trade
      const nearPattern = patternPeriods.some(date => {
        const timeDiff = Math.abs(date.getTime() - tradeDate.getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff <= 5;
      });
      
      if (nearPattern) {
        if (!tradesByStrategy[trade.strategyId]) {
          tradesByStrategy[trade.strategyId] = [];
        }
        
        tradesByStrategy[trade.strategyId].push(trade);
      }
    }
  });
  
  // Calculate performance metrics for each strategy
  return Object.entries(tradesByStrategy).map(([strategyId, trades]) => {
    if (trades.length < 3) {
      return {
        strategyId,
        winRate: 0,
        profitFactor: 0,
        sampleSize: trades.length
      };
    }
    
    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit <= 0);
    
    const winRate = winningTrades.length / trades.length;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    
    return {
      strategyId,
      winRate,
      profitFactor,
      sampleSize: trades.length
    };
  });
}
