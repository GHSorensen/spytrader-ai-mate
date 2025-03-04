
import { format, subDays, subMonths } from 'date-fns';
import { PerformanceChartData } from '@/lib/types/spy';

export const generateEquityCurveData = (days: number, startValue: number = 100000) => {
  const data = [];
  let currentValue = startValue;
  let benchmarkValue = startValue;
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    
    // Random daily change between -2% and 3%
    const dailyChange = (Math.random() * 5 - 2) / 100;
    currentValue = currentValue * (1 + dailyChange);
    
    // Random benchmark change between -1.5% and 2%
    const benchmarkChange = (Math.random() * 3.5 - 1.5) / 100;
    benchmarkValue = benchmarkValue * (1 + benchmarkChange);
    
    data.push({
      date,
      value: Math.round(currentValue * 100) / 100,
      benchmarkValue: Math.round(benchmarkValue * 100) / 100,
    });
  }
  
  return data;
};

export const generateMonthlyPerformanceData = (months: number) => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(currentDate, i);
    const monthName = format(date, 'MMM yyyy');
    
    // Random monthly return between -15% and 20%
    const monthlyReturn = Math.round((Math.random() * 35 - 15) * 10) / 10;
    
    data.push({
      month: monthName,
      return: monthlyReturn,
    });
  }
  
  return data;
};

export const generateProfitDistributionData = () => {
  const ranges = [
    '-50% to -40%',
    '-40% to -30%',
    '-30% to -20%',
    '-20% to -10%',
    '-10% to 0%',
    '0% to 10%',
    '10% to 20%',
    '20% to 30%',
    '30% to 40%',
    '40% to 50%',
    '50%+',
  ];
  
  return ranges.map(range => ({
    range,
    count: Math.floor(Math.random() * 50) + (range.includes('-') ? 5 : 15), // More positive results
  }));
};

export const generateDrawdownsData = (count: number) => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = 0; i < count; i++) {
    const startDate = subDays(currentDate, Math.floor(Math.random() * 365) + 30);
    const durationDays = Math.floor(Math.random() * 30) + 5;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    data.push({
      startDate,
      endDate,
      duration: durationDays,
      depthPercent: Math.round((Math.random() * 25 + 5) * 10) / 10, // 5% to 30%
      recoveryDays: Math.floor(Math.random() * 45) + 5,
    });
  }
  
  // Sort by depth (largest first)
  return data.sort((a, b) => b.depthPercent - a.depthPercent);
};

export const createMockPerformanceChartData = (): PerformanceChartData => {
  return {
    equityCurve: generateEquityCurveData(365),
    profitDistribution: generateProfitDistributionData(),
    monthlyPerformance: generateMonthlyPerformanceData(24),
    drawdowns: generateDrawdownsData(10),
  };
};
