
import { useMemo } from 'react';
import { subDays, subMonths, subYears } from 'date-fns';
import { PerformanceChartData, TimeFrame } from '@/lib/types/spy';

export const useFilteredData = (
  performanceChartData: PerformanceChartData,
  timeFrame: TimeFrame
) => {
  // Get filtered data based on the selected time frame
  const filteredData = useMemo(() => {
    let startDate: Date;
    
    switch (timeFrame) {
      case '1d':
        startDate = subDays(new Date(), 1);
        break;
      case '1w':
        startDate = subDays(new Date(), 7);
        break;
      case '1m':
        startDate = subMonths(new Date(), 1);
        break;
      case '3m':
        startDate = subMonths(new Date(), 3);
        break;
      case '6m':
        startDate = subMonths(new Date(), 6);
        break;
      case 'ytd':
        startDate = new Date(new Date().getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Just use a far back date
        break;
      case '1y':
      default:
        startDate = subYears(new Date(), 1);
        break;
    }
    
    return {
      equityCurve: performanceChartData.equityCurve.filter(item => item.date >= startDate),
      monthlyPerformance: performanceChartData.monthlyPerformance.slice(-getMonthsForTimeFrame(timeFrame)),
      profitDistribution: performanceChartData.profitDistribution,
      drawdowns: performanceChartData.drawdowns.filter(item => item.startDate >= startDate),
    };
  }, [timeFrame, performanceChartData]);
  
  return filteredData;
};

// Helper function to determine how many months to show based on time frame
export const getMonthsForTimeFrame = (tf: TimeFrame): number => {
  switch (tf) {
    case '1d':
    case '1w':
      return 1;
    case '1m':
      return 3;
    case '3m':
      return 6;
    case '6m':
      return 9;
    case '1y':
      return 12;
    case 'ytd':
      return new Date().getMonth() + 1; // Current month index + 1
    case 'all':
    default:
      return 24; // Show all available data
  }
};
