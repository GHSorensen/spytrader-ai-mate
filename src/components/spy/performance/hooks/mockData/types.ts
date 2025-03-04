
import { 
  PerformanceChartData,
  PerformanceSummary,
  TradeAnalytics,
  BacktestResult 
} from '@/lib/types/spy';

export interface MockDataGenerators {
  mockPerformanceSummary: PerformanceSummary;
  mockTradeAnalytics: TradeAnalytics;
  mockPerformanceChartData: PerformanceChartData;
  mockBacktestResults: BacktestResult[];
  generateEquityCurveData: (days: number, startValue?: number) => {
    date: Date;
    value: number;
    benchmarkValue: number;
  }[];
  generateMonthlyPerformanceData: (months: number) => {
    month: string;
    return: number;
  }[];
  generateProfitDistributionData: () => {
    range: string;
    count: number;
  }[];
  generateDrawdownsData: (count: number) => {
    startDate: Date;
    endDate: Date;
    duration: number;
    depthPercent: number;
    recoveryDays: number;
  }[];
}
