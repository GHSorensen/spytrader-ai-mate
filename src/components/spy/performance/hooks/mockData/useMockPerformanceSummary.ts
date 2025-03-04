
import { PerformanceSummary } from '@/lib/types/spy';

export const createMockPerformanceSummary = (): PerformanceSummary => {
  return {
    today: {
      profit: 1250.75,
      percentageChange: 2.3,
      tradesOpened: 5,
      tradesClosed: 3,
    },
    week: {
      profit: 3450.25,
      percentageChange: 5.8,
      tradesOpened: 12,
      tradesClosed: 10,
    },
    month: {
      profit: 8750.50,
      percentageChange: 12.4,
      tradesOpened: 45,
      tradesClosed: 42,
    },
    year: {
      profit: 42500.75,
      percentageChange: 35.2,
      tradesOpened: 215,
      tradesClosed: 205,
      winRate: 68.5,
    },
    allTime: {
      profit: 87500.25,
      percentageChange: 87.5,
      totalTrades: 450,
      winRate: 71.2,
      startDate: new Date('2022-01-01'),
    },
  };
};
