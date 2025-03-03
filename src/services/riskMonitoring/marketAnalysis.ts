
import { 
  MarketRiskProfile,
  RiskSignalSource 
} from './types';
import { 
  SpyMarketData,
  MarketCondition 
} from '@/lib/types/spy';

/**
 * Analyze the current market condition
 */
export function analyzeMarketCondition(
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
 * Calculate a simplified RSI
 */
export function calculateSimplifiedRSI(data: SpyMarketData[]): number {
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
