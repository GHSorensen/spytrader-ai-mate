
import { useState, useEffect } from 'react';
import { SpyMarketData } from '@/lib/types/spy';
import { 
  detectTechnicalPatterns, 
  getTrendDirection,
  calculateSupportResistanceLevels,
  PatternDetectionResult,
  TrendDirection
} from '@/services/patternRecognition/technicalPatterns';
import { getSpyMarketData } from '@/services/spyOptionsService';

export const usePatternRecognition = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [marketData, setMarketData] = useState<SpyMarketData[]>([]);
  const [detectedPatterns, setDetectedPatterns] = useState<PatternDetectionResult[]>([]);
  const [trendDirection, setTrendDirection] = useState<TrendDirection>('sideways');
  const [supportLevels, setSupportLevels] = useState<number[]>([]);
  const [resistanceLevels, setResistanceLevels] = useState<number[]>([]);

  useEffect(() => {
    const loadDataAndDetectPatterns = async () => {
      setIsLoading(true);
      try {
        // Fetch market data
        const data = await getSpyMarketData();
        const marketDataArray = Array.isArray(data) ? data : [data];
        setMarketData(marketDataArray);
        
        if (marketDataArray.length > 0) {
          // Detect technical patterns
          const patterns = detectTechnicalPatterns(marketDataArray);
          setDetectedPatterns(patterns);
          
          // Determine trend direction
          const trend = getTrendDirection(marketDataArray);
          setTrendDirection(trend);
          
          // Calculate support and resistance levels
          const { supports, resistances } = calculateSupportResistanceLevels(marketDataArray);
          setSupportLevels(supports);
          setResistanceLevels(resistances);
        }
      } catch (error) {
        console.error('Error in pattern recognition:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDataAndDetectPatterns();
    
    // Refresh data every 30 minutes
    const intervalId = setInterval(loadDataAndDetectPatterns, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getLatestPatterns = (count: number = 5): PatternDetectionResult[] => {
    return [...detectedPatterns].sort((a, b) => b.confidence - a.confidence).slice(0, count);
  };
  
  const getBullishPatterns = (): PatternDetectionResult[] => {
    return detectedPatterns.filter(p => p.direction === 'bullish')
      .sort((a, b) => b.confidence - a.confidence);
  };
  
  const getBearishPatterns = (): PatternDetectionResult[] => {
    return detectedPatterns.filter(p => p.direction === 'bearish')
      .sort((a, b) => b.confidence - a.confidence);
  };
  
  const getNearestSupportLevel = (currentPrice: number): number | null => {
    if (supportLevels.length === 0) return null;
    
    // Find supports below current price
    const validSupports = supportLevels.filter(s => s < currentPrice);
    if (validSupports.length === 0) return null;
    
    // Return the highest support below current price
    return Math.max(...validSupports);
  };
  
  const getNearestResistanceLevel = (currentPrice: number): number | null => {
    if (resistanceLevels.length === 0) return null;
    
    // Find resistances above current price
    const validResistances = resistanceLevels.filter(r => r > currentPrice);
    if (validResistances.length === 0) return null;
    
    // Return the lowest resistance above current price
    return Math.min(...validResistances);
  };
  
  const getCurrentPrice = (): number | null => {
    if (marketData.length === 0) return null;
    
    // Get the most recent price
    const latestData = [...marketData].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return latestData.price;
  };
  
  return {
    isLoading,
    marketData,
    detectedPatterns,
    trendDirection,
    supportLevels,
    resistanceLevels,
    getLatestPatterns,
    getBullishPatterns,
    getBearishPatterns,
    getNearestSupportLevel,
    getNearestResistanceLevel,
    getCurrentPrice
  };
};
