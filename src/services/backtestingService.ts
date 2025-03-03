
import { 
  BacktestResult, 
  TradingStrategy,
  SpyOption,
  SpyTrade,
  PerformanceMetrics,
  AITradingSettings,
  RiskToleranceType,
  MarketCondition
} from "@/lib/types/spy";
import { getSpyMarketData } from "./spyOptionsService";

// Fetch historical data based on source selection
export const fetchHistoricalData = async (
  startDate: Date,
  endDate: Date,
  dataSource: string
): Promise<{ 
  priceData: { date: Date; open: number; high: number; low: number; close: number; volume: number }[];
  optionsData: { date: Date; options: SpyOption[] }[];
  vixData: { date: Date; value: number }[];
}> => {
  // In a real implementation, this would call different APIs based on dataSource
  console.log(`Fetching historical data from ${dataSource} for ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  // For demo purposes, generate mock historical data
  const priceData = generateMockPriceData(startDate, endDate);
  const optionsData = generateMockOptionsData(startDate, endDate, priceData);
  const vixData = generateMockVixData(startDate, endDate);
  
  return { priceData, optionsData, vixData };
};

// Run a backtest simulation for a given strategy
export const runBacktest = async (
  strategy: TradingStrategy,
  settings: AITradingSettings,
  startDate: Date,
  endDate: Date,
  initialCapital: number,
  includeCommissions: boolean = true,
  commissionPerTrade: number = 0.65,
  includeTaxes: boolean = false,
  taxRate: number = 0.25
): Promise<BacktestResult> => {
  // Fetch historical data
  const { priceData, optionsData, vixData } = await fetchHistoricalData(
    startDate,
    endDate,
    settings.backtestingSettings.dataSource
  );
  
  // Initialize portfolio and metrics
  let capital = initialCapital;
  let equity = initialCapital;
  const equityCurve: {date: Date; equity: number}[] = [{ date: startDate, equity }];
  const trades: SpyTrade[] = [];
  
  // Strategy parameters
  const maxPositionSize = strategy.maxPositionSize;
  const stopLossPercent = strategy.maxLossPerTrade;
  const profitTargetPercent = strategy.profitTarget;
  
  // Track market conditions for each day
  const marketConditions = detectMarketConditions(priceData, vixData);
  
  // Simulation loop - process each day
  for (let i = 1; i < priceData.length; i++) {
    const currentDate = priceData[i].date;
    const previousDate = priceData[i-1].date;
    const currentPrice = priceData[i].close;
    const dailyOptions = optionsData.find(d => 
      d.date.toDateString() === currentDate.toDateString()
    )?.options || [];
    
    // Current market condition
    const currentCondition = marketConditions.find(
      c => c.date.toDateString() === currentDate.toDateString()
    )?.condition || 'neutral';
    
    // Adjust risk based on market condition if enabled
    let adjustedRisk = 1.0;
    const conditionOverride = settings.marketConditionOverrides[currentCondition];
    if (conditionOverride?.enabled) {
      adjustedRisk = conditionOverride.adjustedRisk;
    }
    
    // Close completed trades
    const { updatedTrades, closingProfit } = processTradeClosure(
      trades.filter(t => t.status === 'active'),
      currentDate,
      dailyOptions,
      includeCommissions,
      commissionPerTrade
    );
    
    // Update trades list
    trades.push(...updatedTrades.filter(t => t.status === 'closed'));
    
    // Update capital
    capital += closingProfit;
    
    // Check for new trade opportunities based on strategy
    if (canOpenNewTrade(trades, settings, adjustedRisk)) {
      const newTrades = findTradeOpportunities(
        strategy,
        dailyOptions,
        currentPrice,
        capital,
        maxPositionSize,
        adjustedRisk,
        settings
      );
      
      // Add new trades and deduct capital
      for (const trade of newTrades) {
        const tradeValue = trade.entryPrice * 100 * trade.quantity; // 100 shares per contract
        
        // Apply commission if enabled
        const commission = includeCommissions ? commissionPerTrade * trade.quantity : 0;
        
        if (tradeValue + commission <= capital * (settings.positionSizing.value / 100 * adjustedRisk)) {
          trades.push(trade);
          capital -= (tradeValue + commission);
        }
      }
    }
    
    // Calculate daily equity
    const openTradesValue = calculateOpenTradesValue(
      trades.filter(t => t.status === 'active'),
      dailyOptions
    );
    equity = capital + openTradesValue;
    equityCurve.push({ date: currentDate, equity });
  }
  
  // Calculate final performance metrics
  const performanceMetrics = calculatePerformanceMetrics(
    trades,
    equityCurve,
    initialCapital,
    startDate,
    endDate,
    priceData
  );
  
  // Calculate max drawdown
  const maxDrawdown = calculateMaxDrawdown(equityCurve);
  
  // Calculate market benchmark return
  const marketBenchmarkReturn = (priceData[priceData.length - 1].close / priceData[0].close - 1) * 100;
  
  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    riskProfile: strategy.riskLevel <= 3 ? 'conservative' : strategy.riskLevel <= 7 ? 'moderate' : 'aggressive',
    performanceMetrics,
    equityCurve,
    trades,
    startDate,
    endDate,
    initialCapital,
    finalCapital: equity,
    maxDrawdown,
    annualizedReturn: calculateAnnualizedReturn(initialCapital, equity, startDate, endDate),
    marketBenchmarkReturn
  };
};

// Run multiple backtests with different parameters for optimization
export const optimizeStrategy = async (
  baseStrategy: TradingStrategy,
  settings: AITradingSettings,
  parameterRanges: {
    deltaRange?: [number, number][];
    maxPositionSize?: number[];
    maxLossPerTrade?: number[];
    profitTarget?: number[];
  }
): Promise<{
  strategy: TradingStrategy;
  result: BacktestResult;
}[]> => {
  const results: { strategy: TradingStrategy; result: BacktestResult }[] = [];
  
  // Generate combinations of parameters
  const combinations = generateParameterCombinations(baseStrategy, parameterRanges);
  
  // Run backtest for each combination
  for (const strategy of combinations) {
    const result = await runBacktest(
      strategy,
      settings,
      settings.backtestingSettings.startDate,
      settings.backtestingSettings.endDate,
      settings.backtestingSettings.initialCapital,
      settings.backtestingSettings.includeCommissions,
      settings.backtestingSettings.commissionPerTrade,
      settings.backtestingSettings.includeTaxes,
      settings.backtestingSettings.taxRate
    );
    
    results.push({ strategy, result });
  }
  
  // Sort by performance (e.g., Sharpe ratio)
  return results.sort((a, b) => 
    b.result.performanceMetrics.sharpeRatio - a.result.performanceMetrics.sharpeRatio
  );
};

// Helper functions for backtesting
function generateMockPriceData(startDate: Date, endDate: Date) {
  const priceData: { date: Date; open: number; high: number; low: number; close: number; volume: number }[] = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Start with an initial price around 450 (typical for SPY)
  let price = 450;
  const volatility = 0.01; // daily volatility
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate random price movement
    const dailyChange = (Math.random() - 0.5) * volatility * price;
    const open = price;
    const close = open + dailyChange;
    const high = Math.max(open, close) + Math.random() * volatility * price / 2;
    const low = Math.min(open, close) - Math.random() * volatility * price / 2;
    const volume = Math.floor(50000000 + Math.random() * 50000000);
    
    priceData.push({ date, open, high, low, close, volume });
    price = close;
  }
  
  return priceData;
}

function generateMockOptionsData(
  startDate: Date, 
  endDate: Date, 
  priceData: { date: Date; close: number }[]
) {
  const optionsData: { date: Date; options: SpyOption[] }[] = [];
  
  for (const { date, close } of priceData) {
    // Generate a few options around the current price
    const options: SpyOption[] = [];
    
    // Weekly expiration (next Friday)
    const nextFriday = new Date(date);
    while (nextFriday.getDay() !== 5) {
      nextFriday.setDate(nextFriday.getDate() + 1);
    }
    
    // Monthly expiration (third Friday of next month)
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    while (nextMonth.getDay() !== 5) {
      nextMonth.setDate(nextMonth.getDate() + 1);
    }
    nextMonth.setDate(nextMonth.getDate() + 14); // Third Friday
    
    // Generate options at different strike prices
    const strikes = [
      Math.floor(close * 0.95),
      Math.floor(close * 0.97),
      Math.floor(close * 0.99),
      Math.floor(close),
      Math.ceil(close * 1.01),
      Math.ceil(close * 1.03),
      Math.ceil(close * 1.05)
    ];
    
    for (const strike of strikes) {
      // Weekly call option
      const weeklyCall: SpyOption = {
        id: `call-${date.toISOString()}-${strike}-weekly`,
        strikePrice: strike,
        expirationDate: new Date(nextFriday),
        type: "CALL",
        premium: calculateOptionPremium("CALL", close, strike, nextFriday, date),
        impliedVolatility: 0.2 + Math.random() * 0.1,
        openInterest: Math.floor(1000 + Math.random() * 5000),
        volume: Math.floor(200 + Math.random() * 2000),
        delta: calculateDelta("CALL", close, strike),
        gamma: 0.05 + Math.random() * 0.05,
        theta: -(0.05 + Math.random() * 0.05),
        vega: 0.1 + Math.random() * 0.1
      };
      
      // Weekly put option
      const weeklyPut: SpyOption = {
        id: `put-${date.toISOString()}-${strike}-weekly`,
        strikePrice: strike,
        expirationDate: new Date(nextFriday),
        type: "PUT",
        premium: calculateOptionPremium("PUT", close, strike, nextFriday, date),
        impliedVolatility: 0.2 + Math.random() * 0.1,
        openInterest: Math.floor(1000 + Math.random() * 5000),
        volume: Math.floor(200 + Math.random() * 2000),
        delta: -calculateDelta("PUT", close, strike),
        gamma: 0.05 + Math.random() * 0.05,
        theta: -(0.05 + Math.random() * 0.05),
        vega: 0.1 + Math.random() * 0.1
      };
      
      // Monthly call option
      const monthlyCall: SpyOption = {
        id: `call-${date.toISOString()}-${strike}-monthly`,
        strikePrice: strike,
        expirationDate: new Date(nextMonth),
        type: "CALL",
        premium: calculateOptionPremium("CALL", close, strike, nextMonth, date),
        impliedVolatility: 0.18 + Math.random() * 0.08,
        openInterest: Math.floor(2000 + Math.random() * 8000),
        volume: Math.floor(500 + Math.random() * 3000),
        delta: calculateDelta("CALL", close, strike),
        gamma: 0.03 + Math.random() * 0.04,
        theta: -(0.03 + Math.random() * 0.04),
        vega: 0.15 + Math.random() * 0.1
      };
      
      // Monthly put option
      const monthlyPut: SpyOption = {
        id: `put-${date.toISOString()}-${strike}-monthly`,
        strikePrice: strike,
        expirationDate: new Date(nextMonth),
        type: "PUT",
        premium: calculateOptionPremium("PUT", close, strike, nextMonth, date),
        impliedVolatility: 0.18 + Math.random() * 0.08,
        openInterest: Math.floor(2000 + Math.random() * 8000),
        volume: Math.floor(500 + Math.random() * 3000),
        delta: -calculateDelta("PUT", close, strike),
        gamma: 0.03 + Math.random() * 0.04,
        theta: -(0.03 + Math.random() * 0.04),
        vega: 0.15 + Math.random() * 0.1
      };
      
      options.push(weeklyCall, weeklyPut, monthlyCall, monthlyPut);
    }
    
    optionsData.push({ date, options });
  }
  
  return optionsData;
}

function generateMockVixData(startDate: Date, endDate: Date) {
  const vixData: { date: Date; value: number }[] = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Start with VIX around 15
  let vix = 15;
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate random VIX movement
    const dailyChange = (Math.random() - 0.5) * 1;
    vix = Math.max(8, vix + dailyChange); // VIX is always positive
    
    vixData.push({ date, value: vix });
  }
  
  return vixData;
}

function calculateOptionPremium(
  type: "CALL" | "PUT",
  spotPrice: number,
  strikePrice: number,
  expirationDate: Date,
  currentDate: Date
) {
  // Simplified Black-Scholes-like calculation
  const timeToExpiry = (expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const volatility = 0.2; // Assumed constant
  
  if (type === "CALL") {
    const intrinsicValue = Math.max(0, spotPrice - strikePrice);
    const timeValue = spotPrice * volatility * Math.sqrt(timeToExpiry);
    return parseFloat((intrinsicValue + timeValue).toFixed(2));
  } else {
    const intrinsicValue = Math.max(0, strikePrice - spotPrice);
    const timeValue = spotPrice * volatility * Math.sqrt(timeToExpiry);
    return parseFloat((intrinsicValue + timeValue).toFixed(2));
  }
}

function calculateDelta(type: "CALL" | "PUT", spotPrice: number, strikePrice: number) {
  // Simplified delta calculation
  if (type === "CALL") {
    if (spotPrice < strikePrice * 0.95) return 0.2 + Math.random() * 0.1;
    if (spotPrice > strikePrice * 1.05) return 0.8 + Math.random() * 0.1;
    return 0.5 + (spotPrice - strikePrice) / strikePrice;
  } else {
    if (spotPrice < strikePrice * 0.95) return 0.8 + Math.random() * 0.1;
    if (spotPrice > strikePrice * 1.05) return 0.2 + Math.random() * 0.1;
    return 0.5 - (spotPrice - strikePrice) / strikePrice;
  }
}

function detectMarketConditions(
  priceData: { date: Date; close: number }[],
  vixData: { date: Date; value: number }[]
): { date: Date; condition: MarketCondition }[] {
  const conditions: { date: Date; condition: MarketCondition }[] = [];
  
  for (let i = 10; i < priceData.length; i++) {
    const date = priceData[i].date;
    
    // Calculate 10-day momentum
    const tenDayReturn = (priceData[i].close / priceData[i - 10].close - 1) * 100;
    
    // Get VIX value for current date
    const vixValue = vixData.find(v => v.date.toDateString() === date.toDateString())?.value || 15;
    
    let condition: MarketCondition;
    
    if (vixValue > 25) {
      condition = 'volatile';
    } else if (tenDayReturn > 2) {
      condition = 'bullish';
    } else if (tenDayReturn < -2) {
      condition = 'bearish';
    } else {
      condition = 'neutral';
    }
    
    conditions.push({ date, condition });
  }
  
  return conditions;
}

function processTradeClosure(
  activeTrades: SpyTrade[],
  currentDate: Date,
  currentOptions: SpyOption[],
  includeCommissions: boolean,
  commissionPerTrade: number
): { updatedTrades: SpyTrade[]; closingProfit: number } {
  const updatedTrades = [...activeTrades];
  let closingProfit = 0;
  
  for (let i = 0; i < updatedTrades.length; i++) {
    const trade = updatedTrades[i];
    
    // Find current option price
    const option = currentOptions.find(o => 
      o.strikePrice === trade.strikePrice && 
      o.type === trade.type &&
      o.expirationDate.toDateString() === trade.expirationDate.toDateString()
    );
    
    if (!option) continue; // Option not found in current data
    
    // Update current price
    trade.currentPrice = option.premium;
    
    // Calculate current profit
    const tradeProfitPerContract = trade.currentPrice - trade.entryPrice;
    const totalTradeProfit = tradeProfitPerContract * 100 * trade.quantity; // 100 shares per contract
    trade.profit = totalTradeProfit;
    trade.profitPercentage = (tradeProfitPerContract / trade.entryPrice) * 100;
    
    // Check if trade should be closed
    const shouldClose = 
      // Expired
      currentDate >= trade.expirationDate ||
      // Hit stop loss
      trade.currentPrice <= trade.stopLoss ||
      // Hit target
      trade.currentPrice >= trade.targetPrice;
    
    if (shouldClose) {
      trade.status = 'closed';
      trade.closedAt = new Date(currentDate);
      
      // Apply commission if enabled
      const commission = includeCommissions ? commissionPerTrade * trade.quantity : 0;
      
      closingProfit += totalTradeProfit - commission;
    }
  }
  
  return { updatedTrades, closingProfit };
}

function canOpenNewTrade(
  trades: SpyTrade[],
  settings: AITradingSettings,
  adjustedRisk: number
): boolean {
  // Check number of active trades
  const activeTrades = trades.filter(t => t.status === 'active');
  if (activeTrades.length >= settings.maxSimultaneousTrades) return false;
  
  // Check daily trade limit
  const today = new Date();
  const todayTrades = trades.filter(t => 
    t.openedAt.toDateString() === today.toDateString()
  );
  if (todayTrades.length >= settings.maxDailyTrades) return false;
  
  return true;
}

function findTradeOpportunities(
  strategy: TradingStrategy,
  dailyOptions: SpyOption[],
  currentPrice: number,
  availableCapital: number,
  maxPositionSize: number,
  adjustedRisk: number,
  settings: AITradingSettings
): SpyTrade[] {
  const opportunities: SpyTrade[] = [];
  
  // Filter options based on strategy criteria
  const filteredOptions = dailyOptions.filter(option => {
    // Check option type
    if (strategy.optionType !== 'BOTH' && option.type !== strategy.optionType) return false;
    
    // Check delta range
    if (Math.abs(option.delta) < strategy.deltaRange[0] || Math.abs(option.delta) > strategy.deltaRange[1]) return false;
    
    // Check expiry preference
    const daysToExpiry = (option.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    if (daysToExpiry < 1) return false; // Exclude options expiring today
    
    const monthlyExpiry = daysToExpiry > 21;
    const weeklyExpiry = daysToExpiry <= 21 && daysToExpiry > 7;
    const shortTermExpiry = daysToExpiry <= 7;
    
    let validExpiry = false;
    for (const expiry of strategy.expiryPreference) {
      if ((expiry === 'monthly' && monthlyExpiry) ||
          (expiry === 'weekly' && weeklyExpiry) ||
          (expiry === 'shortTerm' && shortTermExpiry)) {
        validExpiry = true;
        break;
      }
    }
    
    if (!validExpiry) return false;
    
    return true;
  });
  
  // Sort by highest confidence score potential (using delta as proxy)
  const sortedOptions = filteredOptions.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  
  // Take top options
  const topOptions = sortedOptions.slice(0, 3);
  
  for (const option of topOptions) {
    // Calculate confidence score (simplified)
    const confidenceScore = Math.min(0.95, 0.5 + Math.abs(option.delta) * 0.4);
    
    // Skip if below minimum confidence threshold
    if (confidenceScore < settings.minimumConfidenceScore) continue;
    
    // Calculate position size
    const maxContracts = Math.floor(maxPositionSize / (option.premium * 100));
    const positionSize = Math.min(
      maxContracts,
      Math.floor((availableCapital * adjustedRisk * (settings.positionSizing.value / 100)) / (option.premium * 100))
    );
    
    if (positionSize < 1) continue; // Skip if can't buy at least one contract
    
    // Generate a new trade
    const newTrade: SpyTrade = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      optionId: option.id,
      type: option.type,
      strikePrice: option.strikePrice,
      expirationDate: new Date(option.expirationDate),
      entryPrice: option.premium,
      currentPrice: option.premium,
      targetPrice: option.type === 'CALL' 
        ? option.premium * (1 + strategy.profitTarget / 100)
        : option.premium * (1 + strategy.profitTarget / 100),
      stopLoss: option.premium * (1 - strategy.maxLossPerTrade / 100),
      quantity: positionSize,
      status: 'active',
      openedAt: new Date(),
      profit: 0,
      profitPercentage: 0,
      confidenceScore
    };
    
    opportunities.push(newTrade);
  }
  
  return opportunities;
}

function calculateOpenTradesValue(activeTrades: SpyTrade[], currentOptions: SpyOption[]): number {
  let totalValue = 0;
  
  for (const trade of activeTrades) {
    const option = currentOptions.find(o => 
      o.strikePrice === trade.strikePrice && 
      o.type === trade.type &&
      o.expirationDate.toDateString() === trade.expirationDate.toDateString()
    );
    
    if (option) {
      totalValue += option.premium * 100 * trade.quantity;
    }
  }
  
  return totalValue;
}

function calculatePerformanceMetrics(
  trades: SpyTrade[],
  equityCurve: {date: Date; equity: number}[],
  initialCapital: number,
  startDate: Date,
  endDate: Date,
  priceData: { date: Date; close: number }[]
): PerformanceMetrics {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const successfulTrades = closedTrades.filter(t => (t.profit || 0) > 0);
  const failedTrades = closedTrades.filter(t => (t.profit || 0) <= 0);
  
  const totalTrades = closedTrades.length;
  const winRate = totalTrades > 0 ? successfulTrades.length / totalTrades : 0;
  
  const totalProfit = successfulTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalLoss = Math.abs(failedTrades.reduce((sum, t) => sum + (t.profit || 0), 0));
  const netProfit = totalProfit - totalLoss;
  
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
  
  const averageWin = successfulTrades.length > 0 
    ? totalProfit / successfulTrades.length 
    : 0;
    
  const averageLoss = failedTrades.length > 0 
    ? totalLoss / failedTrades.length 
    : 0;
  
  // Calculate daily returns
  const dailyReturns: { date: Date; return: number }[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prevEquity = equityCurve[i-1].equity;
    const currentEquity = equityCurve[i].equity;
    const dailyReturn = (currentEquity / prevEquity) - 1;
    dailyReturns.push({
      date: equityCurve[i].date,
      return: dailyReturn
    });
  }
  
  // Calculate returns volatility
  const returns = dailyReturns.map(r => r.return);
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const returnsVolatility = Math.sqrt(variance);
  
  // Calculate Sharpe ratio (assuming risk-free rate of 0.02 or 2%)
  const riskFreeRate = 0.02;
  const annualizedReturn = calculateAnnualizedReturn(initialCapital, equityCurve[equityCurve.length - 1].equity, startDate, endDate);
  const sharpeRatio = (annualizedReturn - riskFreeRate) / (returnsVolatility * Math.sqrt(252));
  
  // Calculate Sortino ratio (using only negative returns)
  const negativeReturns = returns.filter(r => r < 0);
  const downside = negativeReturns.length > 0
    ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length) * Math.sqrt(252)
    : 0.0001; // Avoid division by zero
  const sortinoRatio = (annualizedReturn - riskFreeRate) / downside;
  
  // Calculate max drawdown
  const maxDrawdown = calculateMaxDrawdown(equityCurve);
  
  // Calculate Calmar ratio
  const calmarRatio = maxDrawdown.percentage > 0 
    ? annualizedReturn / (maxDrawdown.percentage / 100) 
    : annualizedReturn;
  
  // Group returns by month
  const monthlyReturns: { month: string; return: number }[] = [];
  let currentMonth = '';
  let monthStartIndex = 0;
  
  for (let i = 0; i < equityCurve.length; i++) {
    const date = equityCurve[i].date;
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (month !== currentMonth) {
      if (currentMonth !== '') {
        const startEquity = equityCurve[monthStartIndex].equity;
        const endEquity = equityCurve[i - 1].equity;
        const monthReturn = (endEquity / startEquity) - 1;
        
        monthlyReturns.push({
          month: currentMonth,
          return: monthReturn
        });
      }
      
      currentMonth = month;
      monthStartIndex = i;
    }
    
    // Handle the last month
    if (i === equityCurve.length - 1) {
      const startEquity = equityCurve[monthStartIndex].equity;
      const endEquity = equityCurve[i].equity;
      const monthReturn = (endEquity / startEquity) - 1;
      
      monthlyReturns.push({
        month: currentMonth,
        return: monthReturn
      });
    }
  }
  
  // Group returns by year
  const annualReturns: { year: number; return: number }[] = [];
  let currentYear = 0;
  let yearStartIndex = 0;
  
  for (let i = 0; i < equityCurve.length; i++) {
    const date = equityCurve[i].date;
    const year = date.getFullYear();
    
    if (year !== currentYear) {
      if (currentYear !== 0) {
        const startEquity = equityCurve[yearStartIndex].equity;
        const endEquity = equityCurve[i - 1].equity;
        const yearReturn = (endEquity / startEquity) - 1;
        
        annualReturns.push({
          year: currentYear,
          return: yearReturn
        });
      }
      
      currentYear = year;
      yearStartIndex = i;
    }
    
    // Handle the last year
    if (i === equityCurve.length - 1) {
      const startEquity = equityCurve[yearStartIndex].equity;
      const endEquity = equityCurve[i].equity;
      const yearReturn = (endEquity / startEquity) - 1;
      
      annualReturns.push({
        year: currentYear,
        return: yearReturn
      });
    }
  }
  
  // Calculate consecutive wins/losses
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let currentConsecutiveWins = 0;
  let currentConsecutiveLosses = 0;
  
  for (const trade of closedTrades) {
    if ((trade.profit || 0) > 0) {
      currentConsecutiveWins++;
      currentConsecutiveLosses = 0;
      if (currentConsecutiveWins > consecutiveWins) {
        consecutiveWins = currentConsecutiveWins;
      }
    } else {
      currentConsecutiveLosses++;
      currentConsecutiveWins = 0;
      if (currentConsecutiveLosses > consecutiveLosses) {
        consecutiveLosses = currentConsecutiveLosses;
      }
    }
  }
  
  // Calculate average duration (in minutes)
  let totalDuration = 0;
  for (const trade of closedTrades) {
    if (trade.closedAt) {
      const duration = (trade.closedAt.getTime() - trade.openedAt.getTime()) / (1000 * 60);
      totalDuration += duration;
    }
  }
  const averageDuration = totalTrades > 0 ? totalDuration / totalTrades : 0;
  
  // Find best and worst trades
  const bestTrade = successfulTrades.length > 0
    ? Math.max(...successfulTrades.map(t => t.profit || 0))
    : 0;
    
  const worstTrade = failedTrades.length > 0
    ? Math.min(...failedTrades.map(t => t.profit || 0))
    : 0;
  
  // Calculate Kelly percentage
  const kellyPercentage = winRate > 0 && averageLoss > 0
    ? (winRate - ((1 - winRate) / (averageWin / averageLoss))) * 100
    : 0;
  
  // Calculate benchmark comparison (SPY)
  const startPrice = priceData[0].close;
  const endPrice = priceData[priceData.length - 1].close;
  const spyReturn = (endPrice / startPrice - 1) * 100;
  const outperformance = (equityCurve[equityCurve.length - 1].equity / initialCapital - 1) * 100 - spyReturn;
  
  return {
    totalTrades,
    winRate,
    profitFactor,
    averageWin,
    averageLoss,
    netProfit,
    totalProfit,
    totalLoss,
    maxDrawdown: maxDrawdown.percentage,
    sharpeRatio,
    successfulTrades: successfulTrades.length,
    failedTrades: failedTrades.length,
    averageDuration,
    bestTrade,
    worstTrade,
    consecutiveWins,
    consecutiveLosses,
    returnsVolatility,
    sortinoRatio,
    calmarRatio,
    dailyReturns,
    monthlyReturns,
    annualReturns,
    riskAdjustedReturn: sharpeRatio,
    kellyPercentage,
    dollarReturn: netProfit,
    percentageReturn: (netProfit / initialCapital) * 100,
    benchmarkComparison: {
      spyReturn,
      outperformance
    }
  };
}

function calculateMaxDrawdown(equityCurve: {date: Date; equity: number}[]): {
  amount: number;
  percentage: number;
  startDate: Date;
  endDate: Date;
} {
  let maxDrawdown = 0;
  let maxDrawdownPercentage = 0;
  let peakEquity = equityCurve[0].equity;
  let peakDate = equityCurve[0].date;
  let troughDate = equityCurve[0].date;
  let currentDrawdown, currentDrawdownPercentage;
  
  for (const { date, equity } of equityCurve) {
    if (equity > peakEquity) {
      peakEquity = equity;
      peakDate = date;
    }
    
    currentDrawdown = peakEquity - equity;
    currentDrawdownPercentage = (currentDrawdown / peakEquity) * 100;
    
    if (currentDrawdownPercentage > maxDrawdownPercentage) {
      maxDrawdown = currentDrawdown;
      maxDrawdownPercentage = currentDrawdownPercentage;
      troughDate = date;
    }
  }
  
  return {
    amount: maxDrawdown,
    percentage: maxDrawdownPercentage,
    startDate: peakDate,
    endDate: troughDate
  };
}

function calculateAnnualizedReturn(
  initialCapital: number,
  finalCapital: number,
  startDate: Date,
  endDate: Date
): number {
  const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return years > 0
    ? Math.pow(finalCapital / initialCapital, 1 / years) - 1
    : 0;
}

function generateParameterCombinations(
  baseStrategy: TradingStrategy,
  parameterRanges: {
    deltaRange?: [number, number][];
    maxPositionSize?: number[];
    maxLossPerTrade?: number[];
    profitTarget?: number[];
  }
): TradingStrategy[] {
  const combinations: TradingStrategy[] = [];
  
  // Use provided parameter ranges or defaults if not provided
  const deltaRanges = parameterRanges.deltaRange || [baseStrategy.deltaRange];
  const positionSizes = parameterRanges.maxPositionSize || [baseStrategy.maxPositionSize];
  const stopLosses = parameterRanges.maxLossPerTrade || [baseStrategy.maxLossPerTrade];
  const profitTargets = parameterRanges.profitTarget || [baseStrategy.profitTarget];
  
  // Generate all combinations
  for (const deltaRange of deltaRanges) {
    for (const positionSize of positionSizes) {
      for (const stopLoss of stopLosses) {
        for (const profitTarget of profitTargets) {
          const strategy: TradingStrategy = {
            ...baseStrategy,
            id: `${baseStrategy.id}-${Math.random().toString(36).substring(7)}`,
            deltaRange,
            maxPositionSize: positionSize,
            maxLossPerTrade: stopLoss,
            profitTarget
          };
          
          combinations.push(strategy);
        }
      }
    }
  }
  
  return combinations;
}
