
import { SpyTrade } from '@/lib/types/spy';

/**
 * Creates a mock trade for testing purposes
 */
export const createMockTrade = (): SpyTrade => {
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
  
  return {
    id: `test-${Date.now()}`,
    type: Math.random() > 0.5 ? "CALL" : "PUT",
    strikePrice: 500,
    expirationDate: expiryDate,
    entryPrice: 3.45,
    currentPrice: 3.45,
    targetPrice: 5.0,
    stopLoss: 2.0,
    quantity: 1,
    status: "active",
    openedAt: now,
    profit: 0,
    profitPercentage: 0,
    confidenceScore: 0.75,
    paperTrading: true
  };
};

/**
 * Returns mock trades filtered by the active tab
 */
export const getMockTrades = (tab: string): SpyTrade[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const mockTrades: SpyTrade[] = [
    {
      id: 'mock-active-1',
      type: "CALL",
      strikePrice: 500,
      expirationDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days later
      entryPrice: 3.45,
      currentPrice: 3.75,
      targetPrice: 5.0,
      stopLoss: 2.0,
      quantity: 1,
      status: "active",
      openedAt: yesterday,
      profit: 30,
      profitPercentage: 8.7,
      confidenceScore: 0.78,
      paperTrading: true
    },
    {
      id: 'mock-closed-1',
      type: "PUT",
      strikePrice: 495,
      expirationDate: new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)), // 3 days later
      entryPrice: 2.80,
      currentPrice: 2.05,
      targetPrice: 4.0,
      stopLoss: 1.5,
      quantity: 2,
      status: "closed",
      openedAt: new Date(yesterday.getTime() - (2 * 24 * 60 * 60 * 1000)), // 3 days ago
      closedAt: yesterday,
      profit: -150,
      profitPercentage: -26.8,
      confidenceScore: 0.65,
      paperTrading: true
    }
  ];
  
  if (tab === 'active') {
    return mockTrades.filter(t => t.status === 'active' || t.status === 'pending');
  } else if (tab === 'history') {
    return mockTrades.filter(t => t.status === 'closed');
  } else if (tab === 'orders') {
    return mockTrades.filter(t => t.status === 'pending');
  }
  
  return mockTrades;
};
