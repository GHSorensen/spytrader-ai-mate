import { SpyMarketData } from '@/lib/types/spy';

export type TechnicalPattern = 
  'DoubleTop' | 
  'DoubleBottom' | 
  'HeadAndShoulders' | 
  'InverseHeadAndShoulders' | 
  'BullishFlag' | 
  'BearishFlag' | 
  'BullishPennant' | 
  'BearishPennant' | 
  'SymmetricalTriangle' | 
  'AscendingTriangle' | 
  'DescendingTriangle' | 
  'BullishEngulfing' | 
  'BearishEngulfing' | 
  'Doji' | 
  'MorningStar' | 
  'EveningStar';

export type TrendDirection = 'up' | 'down' | 'sideways';

export interface PatternDetectionResult {
  pattern: TechnicalPattern;
  confidence: number; // 0-1
  startIndex: number;
  endIndex: number;
  direction: 'bullish' | 'bearish';
  expectedMovePercent: number; // expected percentage move
  stopLossLevel: number;       // price to place stop loss
  targetLevel: number;         // price target
  description: string;
}

/**
 * Detect technical patterns in price data
 */
export function detectTechnicalPatterns(
  marketData: SpyMarketData[]
): PatternDetectionResult[] {
  if (marketData.length < 30) {
    return [];
  }
  
  // Sort data by timestamp (oldest first)
  const sortedData = [...marketData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const patterns: PatternDetectionResult[] = [];
  
  // Add pattern detection functions
  patterns.push(...detectDoubleTop(sortedData));
  patterns.push(...detectDoubleBottom(sortedData));
  patterns.push(...detectHeadAndShoulders(sortedData));
  patterns.push(...detectInverseHeadAndShoulders(sortedData));
  patterns.push(...detectBullishFlag(sortedData));
  patterns.push(...detectBearishFlag(sortedData));
  patterns.push(...detectEngulfingPatterns(sortedData));
  patterns.push(...detectTrianglePatterns(sortedData));
  
  return patterns;
}

/**
 * Get the current trend direction
 */
export function getTrendDirection(marketData: SpyMarketData[], periods: number = 20): TrendDirection {
  if (marketData.length < periods) {
    return 'sideways';
  }
  
  // Sort data by timestamp (oldest first)
  const sortedData = [...marketData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Get recent data for trend analysis
  const recentData = sortedData.slice(-periods);
  
  // Calculate linear regression
  const prices = recentData.map(d => d.price);
  const xValues = Array.from({ length: prices.length }, (_, i) => i);
  
  const { slope } = calculateLinearRegression(xValues, prices);
  
  // Calculate percentage change over period
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const percentChange = ((endPrice - startPrice) / startPrice) * 100;
  
  // Determine trend
  if (Math.abs(percentChange) < 2) {
    return 'sideways';
  }
  
  return slope > 0 ? 'up' : 'down';
}

/**
 * Calculate key support and resistance levels
 */
export function calculateSupportResistanceLevels(
  marketData: SpyMarketData[],
  periodsToAnalyze: number = 60
): { supports: number[], resistances: number[] } {
  if (marketData.length < 20) {
    return { supports: [], resistances: [] };
  }
  
  // Sort data by timestamp (oldest first)
  const sortedData = [...marketData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Get recent data
  const recentData = sortedData.slice(-periodsToAnalyze);
  const prices = recentData.map(d => d.price);
  
  // Detect local highs and lows
  const localHighs: number[] = [];
  const localLows: number[] = [];
  
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] > prices[i-1] && prices[i] > prices[i+1]) {
      localHighs.push(prices[i]);
    }
    
    if (prices[i] < prices[i-1] && prices[i] < prices[i+1]) {
      localLows.push(prices[i]);
    }
  }
  
  // Group similar price levels (within 0.5% of each other)
  const groupedHighs = groupSimilarPrices(localHighs, 0.005);
  const groupedLows = groupSimilarPrices(localLows, 0.005);
  
  // Sort by strength (frequency)
  const sortedHighs = Object.entries(groupedHighs)
    .map(([price, count]) => ({ price: parseFloat(price), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 resistance levels
    .map(item => item.price);
    
  const sortedLows = Object.entries(groupedLows)
    .map(([price, count]) => ({ price: parseFloat(price), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 support levels
    .map(item => item.price);
  
  return {
    supports: sortedLows,
    resistances: sortedHighs
  };
}

// Helper function to group similar prices
function groupSimilarPrices(prices: number[], threshold: number): Record<string, number> {
  const grouped: Record<string, number> = {};
  
  prices.forEach(price => {
    // Check if this price is close to an existing group
    let foundGroup = false;
    
    for (const existingPrice in grouped) {
      const diff = Math.abs(price - parseFloat(existingPrice)) / price;
      
      if (diff < threshold) {
        // Add to existing group with weighted average
        const count = grouped[existingPrice];
        const newPrice = ((parseFloat(existingPrice) * count) + price) / (count + 1);
        
        // Remove old group
        delete grouped[existingPrice];
        
        // Add new group
        grouped[newPrice.toString()] = count + 1;
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      // Create new group
      grouped[price.toString()] = 1;
    }
  });
  
  return grouped;
}

// Helper function for linear regression
function calculateLinearRegression(x: number[], y: number[]): { slope: number, intercept: number, r2: number } {
  const n = x.length;
  
  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denominator += (x[i] - meanX) ** 2;
  }
  
  const slope = numerator / denominator;
  const intercept = meanY - (slope * meanX);
  
  // Calculate R-squared
  let ssr = 0; // Sum of squared residuals
  let sst = 0; // Total sum of squares
  
  for (let i = 0; i < n; i++) {
    const prediction = slope * x[i] + intercept;
    ssr += (y[i] - prediction) ** 2;
    sst += (y[i] - meanY) ** 2;
  }
  
  const r2 = 1 - (ssr / sst);
  
  return { slope, intercept, r2 };
}

// Implementation of pattern detection algorithms

function detectDoubleTop(data: SpyMarketData[]): PatternDetectionResult[] {
  const patterns: PatternDetectionResult[] = [];
  const prices = data.map(d => d.price);
  
  // Need sufficient data
  if (prices.length < 20) {
    return patterns;
  }
  
  // Look for two peaks of similar height
  for (let i = 5; i < prices.length - 5; i++) {
    // Check if we have a peak
    if (prices[i] > prices[i-1] && prices[i] > prices[i+1] && 
        prices[i] > prices[i-2] && prices[i] > prices[i+2]) {
      
      // Look for another peak of similar height
      for (let j = i + 3; j < prices.length - 2; j++) {
        if (prices[j] > prices[j-1] && prices[j] > prices[j+1] && 
            prices[j] > prices[j-2] && prices[j] > prices[j+2]) {
          
          // Calculate percentage difference between peaks
          const diff = Math.abs(prices[i] - prices[j]) / prices[i];
          
          // Peaks should be within 3% of each other for double top
          if (diff < 0.03) {
            // Find minimum between peaks
            let minBetween = Infinity;
            let minIndex = -1;
            
            for (let k = i + 1; k < j; k++) {
              if (prices[k] < minBetween) {
                minBetween = prices[k];
                minIndex = k;
              }
            }
            
            // Neckline is the minimum between the peaks
            const neckline = minBetween;
            
            // Check if pattern is valid (price has fallen below neckline after second peak)
            let validPattern = false;
            for (let k = j + 1; k < Math.min(prices.length, j + 5); k++) {
              if (prices[k] < neckline) {
                validPattern = true;
                break;
              }
            }
            
            if (validPattern) {
              // Calculate pattern height
              const height = prices[i] - neckline;
              const targetMove = height; // typical target is pattern height
              
              patterns.push({
                pattern: 'DoubleTop',
                confidence: 0.7 - diff,
                startIndex: i - 2,
                endIndex: j + 2,
                direction: 'bearish',
                expectedMovePercent: (targetMove / prices[j]) * 100,
                stopLossLevel: Math.max(prices[i], prices[j]) * 1.02, // 2% above the highest peak
                targetLevel: neckline - targetMove,
                description: 'Double Top pattern suggests a potential reversal from bullish to bearish'
              });
              
              // Skip ahead to avoid overlapping patterns
              i = j + 1;
              break;
            }
          }
        }
      }
    }
  }
  
  return patterns;
}

function detectDoubleBottom(data: SpyMarketData[]): PatternDetectionResult[] {
  const patterns: PatternDetectionResult[] = [];
  const prices = data.map(d => d.price);
  
  // Need sufficient data
  if (prices.length < 20) {
    return patterns;
  }
  
  // Look for two troughs of similar height
  for (let i = 5; i < prices.length - 5; i++) {
    // Check if we have a trough
    if (prices[i] < prices[i-1] && prices[i] < prices[i+1] && 
        prices[i] < prices[i-2] && prices[i] < prices[i+2]) {
      
      // Look for another trough of similar height
      for (let j = i + 3; j < prices.length - 2; j++) {
        if (prices[j] < prices[j-1] && prices[j] < prices[j+1] && 
            prices[j] < prices[j-2] && prices[j] < prices[j+2]) {
          
          // Calculate percentage difference between troughs
          const diff = Math.abs(prices[i] - prices[j]) / prices[i];
          
          // Troughs should be within 3% of each other for double bottom
          if (diff < 0.03) {
            // Find maximum between troughs
            let maxBetween = -Infinity;
            let maxIndex = -1;
            
            for (let k = i + 1; k < j; k++) {
              if (prices[k] > maxBetween) {
                maxBetween = prices[k];
                maxIndex = k;
              }
            }
            
            // Neckline is the maximum between the troughs
            const neckline = maxBetween;
            
            // Check if pattern is valid (price has risen above neckline after second trough)
            let validPattern = false;
            for (let k = j + 1; k < Math.min(prices.length, j + 5); k++) {
              if (prices[k] > neckline) {
                validPattern = true;
                break;
              }
            }
            
            if (validPattern) {
              // Calculate pattern height
              const height = neckline - prices[i];
              const targetMove = height; // typical target is pattern height
              
              patterns.push({
                pattern: 'DoubleBottom',
                confidence: 0.7 - diff,
                startIndex: i - 2,
                endIndex: j + 2,
                direction: 'bullish',
                expectedMovePercent: (targetMove / prices[j]) * 100,
                stopLossLevel: Math.min(prices[i], prices[j]) * 0.98, // 2% below the lowest trough
                targetLevel: neckline + targetMove,
                description: 'Double Bottom pattern suggests a potential reversal from bearish to bullish'
              });
              
              // Skip ahead to avoid overlapping patterns
              i = j + 1;
              break;
            }
          }
        }
      }
    }
  }
  
  return patterns;
}

// Other pattern detection functions
function detectHeadAndShoulders(data: SpyMarketData[]): PatternDetectionResult[] {
  // Simplified implementation for now
  return [];
}

function detectInverseHeadAndShoulders(data: SpyMarketData[]): PatternDetectionResult[] {
  // Simplified implementation for now
  return [];
}

function detectBullishFlag(data: SpyMarketData[]): PatternDetectionResult[] {
  // Simplified implementation for now
  return [];
}

function detectBearishFlag(data: SpyMarketData[]): PatternDetectionResult[] {
  // Simplified implementation for now
  return [];
}

function detectEngulfingPatterns(data: SpyMarketData[]): PatternDetectionResult[] {
  // Simplified implementation for now
  return [];
}

function detectTrianglePatterns(data: SpyMarketData[]): PatternDetectionResult[] {
  // Simplified implementation for now
  return [];
}
