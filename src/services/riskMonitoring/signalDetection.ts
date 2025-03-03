
import { v4 as uuidv4 } from 'uuid';
import { 
  RiskSignal,
  RiskSignalSource,
  RiskSignalStrength,
  RiskSignalDirection,
  MarketRiskProfile
} from './types';
import { 
  AITradingSettings, 
  SpyMarketData, 
  SpyTrade,
  MarketCondition
} from '@/lib/types/spy';
import { calculateSimplifiedRSI } from './marketAnalysis';

/**
 * Detect all risk signals based on market data and current conditions
 */
export function detectSignals(
  marketData: SpyMarketData,
  historicalMarketData: SpyMarketData[],
  currentTrades: SpyTrade[],
  settings: AITradingSettings,
  currentMarketProfile: MarketRiskProfile
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
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
  
  return signals;
}

/**
 * Group signals by source and direction
 */
export function groupSignalsBySourceAndDirection(signals: RiskSignal[]): Record<string, RiskSignal[]> {
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
 * Detect technical signals
 */
export function detectTechnicalSignals(
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
export function detectVolatilitySignals(
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
export function detectEconomicSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would use actual economic data sources
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Detect earnings signals 
 */
export function detectEarningsSignals(
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
export function detectFedMeetingSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would check for upcoming Fed meetings
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Detect geopolitical signals
 */
export function detectGeopoliticalSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would use news APIs or other data sources
  // This is just a placeholder for demonstration
  return [];
}

/**
 * Detect sentiment signals
 */
export function detectSentimentSignals(marketProfile: MarketRiskProfile): RiskSignal[] {
  // In a real implementation, this would use social media sentiment data
  // This is just a placeholder for demonstration
  return [];
}
