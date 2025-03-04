
import { useState } from 'react';
import { MockDataGenerators } from './mockData/types';
import { 
  createMockPerformanceSummary, 
  createMockTradeAnalytics,
  createMockPerformanceChartData,
  createMockBacktestResults,
  generateEquityCurveData,
  generateMonthlyPerformanceData,
  generateProfitDistributionData,
  generateDrawdownsData
} from './mockData';

export const useMockPerformanceData = (): MockDataGenerators => {
  // Use the imported mock data creators to get all mock data
  const mockPerformanceSummary = createMockPerformanceSummary();
  const mockTradeAnalytics = createMockTradeAnalytics();
  const mockPerformanceChartData = createMockPerformanceChartData();
  const mockBacktestResults = createMockBacktestResults();

  // Return all the mock data and helper functions
  return {
    mockPerformanceSummary,
    mockTradeAnalytics,
    mockPerformanceChartData,
    mockBacktestResults,
    // Helper functions
    generateEquityCurveData,
    generateMonthlyPerformanceData,
    generateProfitDistributionData,
    generateDrawdownsData,
  };
};
