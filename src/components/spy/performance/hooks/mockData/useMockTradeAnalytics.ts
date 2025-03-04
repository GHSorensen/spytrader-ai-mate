
import { TradeAnalytics } from '@/lib/types/spy';

export const createMockTradeAnalytics = (): TradeAnalytics => {
  return {
    byStrategy: [
      {
        strategyId: '1',
        strategyName: 'Momentum Breakout',
        trades: 120,
        winRate: 72.5,
        averageReturn: 15.3,
        totalProfit: 25750.50,
      },
      {
        strategyId: '2',
        strategyName: 'Volatility Crush',
        trades: 85,
        winRate: 68.2,
        averageReturn: 12.8,
        totalProfit: 18250.75,
      },
      {
        strategyId: '3',
        strategyName: 'Mean Reversion',
        trades: 95,
        winRate: 65.8,
        averageReturn: 10.5,
        totalProfit: 15500.25,
      },
      {
        strategyId: '4',
        strategyName: 'Trend Following',
        trades: 150,
        winRate: 75.3,
        averageReturn: 18.2,
        totalProfit: 28000.50,
      },
    ],
    byOptionType: [
      {
        type: 'CALL',
        trades: 250,
        winRate: 73.5,
        averageReturn: 16.8,
        totalProfit: 48750.25,
      },
      {
        type: 'PUT',
        trades: 200,
        winRate: 68.5,
        averageReturn: 14.2,
        totalProfit: 38750.50,
      },
    ],
    byExpiry: [
      {
        expiry: 'daily',
        trades: 120,
        winRate: 65.8,
        averageReturn: 12.5,
        totalProfit: 22500.75,
      },
      {
        expiry: 'weekly',
        trades: 220,
        winRate: 72.5,
        averageReturn: 15.8,
        totalProfit: 42500.50,
      },
      {
        expiry: 'monthly',
        trades: 110,
        winRate: 75.2,
        averageReturn: 18.5,
        totalProfit: 22500.25,
      },
    ],
    byHoldingPeriod: [
      {
        period: '0-1 days',
        trades: 150,
        winRate: 68.5,
        averageReturn: 12.8,
        totalProfit: 28750.50,
      },
      {
        period: '1-3 days',
        trades: 180,
        winRate: 72.5,
        averageReturn: 15.3,
        totalProfit: 35500.25,
      },
      {
        period: '3-7 days',
        trades: 85,
        winRate: 75.8,
        averageReturn: 18.2,
        totalProfit: 18250.75,
      },
      {
        period: '>7 days',
        trades: 35,
        winRate: 62.5,
        averageReturn: 10.5,
        totalProfit: 5000.50,
      },
    ],
  };
};
