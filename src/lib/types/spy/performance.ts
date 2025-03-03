
export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  netProfit: number;
  totalProfit: number;
  totalLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  successfulTrades: number;
  failedTrades: number;
  averageDuration: number; // in minutes
  bestTrade: number;
  worstTrade: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  returnsVolatility: number;
  sortinoRatio: number;
  calmarRatio: number;
  dailyReturns: { date: Date; return: number }[];
  monthlyReturns: { month: string; return: number }[];
  annualReturns: { year: number; return: number }[];
  riskAdjustedReturn: number;
  kellyPercentage: number;
  dollarReturn: number;
  percentageReturn: number;
  benchmarkComparison: {
    spyReturn: number;
    outperformance: number;
  };
}

export interface PerformanceSummary {
  today: {
    profit: number;
    percentageChange: number;
    tradesOpened: number;
    tradesClosed: number;
  };
  week: {
    profit: number;
    percentageChange: number;
    tradesOpened: number;
    tradesClosed: number;
  };
  month: {
    profit: number;
    percentageChange: number;
    tradesOpened: number;
    tradesClosed: number;
  };
  year: {
    profit: number;
    percentageChange: number;
    tradesOpened: number;
    tradesClosed: number;
    winRate: number;
  };
  allTime: {
    profit: number;
    percentageChange: number;
    totalTrades: number;
    winRate: number;
    startDate: Date;
  };
}

export interface TradeAnalytics {
  byStrategy: {
    strategyId: string;
    strategyName: string;
    trades: number;
    winRate: number;
    averageReturn: number;
    totalProfit: number;
  }[];
  byOptionType: {
    type: string;
    trades: number;
    winRate: number;
    averageReturn: number;
    totalProfit: number;
  }[];
  byExpiry: {
    expiry: string;
    trades: number;
    winRate: number;
    averageReturn: number;
    totalProfit: number;
  }[];
  byHoldingPeriod: {
    period: string; // e.g., "0-1 days", "1-3 days", "3-7 days", ">7 days"
    trades: number;
    winRate: number;
    averageReturn: number;
    totalProfit: number;
  }[];
}

export interface PerformanceChartData {
  equityCurve: {
    date: Date;
    value: number;
    benchmarkValue: number;
  }[];
  profitDistribution: {
    range: string; // e.g., "-50% to -40%", "-40% to -30%", etc.
    count: number;
  }[];
  monthlyPerformance: {
    month: string; // e.g., "Jan 2023", "Feb 2023", etc.
    return: number;
  }[];
  drawdowns: {
    startDate: Date;
    endDate: Date;
    duration: number; // in days
    depthPercent: number;
    recoveryDays: number;
  }[];
}
