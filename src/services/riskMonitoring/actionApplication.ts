
import { 
  RiskAction, 
  RiskActionType 
} from './types';
import { 
  AITradingSettings, 
  SpyTrade,
  SpyOption
} from '@/lib/types/spy';

/**
 * Apply risk actions to trades
 */
export function applyActions(
  actions: RiskAction[],
  currentTrades: SpyTrade[],
  availableOptions: SpyOption[],
  settings: AITradingSettings
): SpyTrade[] {
  const updatedTrades = [...currentTrades];
  
  // Process each action
  for (const action of actions) {
    const tradesToModify = updatedTrades.filter(t => 
      t.status === 'active' && action.tradeIds.includes(t.id)
    );
    
    if (tradesToModify.length === 0) continue;
    
    switch (action.actionType) {
      case 'reduce_position_size':
        applyReducePositionSize(tradesToModify, action, updatedTrades);
        break;
      case 'increase_position_size':
        applyIncreasePositionSize(tradesToModify, action, updatedTrades, availableOptions);
        break;
      case 'exit_trade':
        applyExitTrade(tradesToModify, action, updatedTrades);
        break;
      case 'hedge_position':
        applyHedgePosition(tradesToModify, action, updatedTrades, availableOptions, settings);
        break;
      case 'adjust_stop_loss':
        applyAdjustStopLoss(tradesToModify, action);
        break;
      case 'adjust_take_profit':
        applyAdjustTakeProfit(tradesToModify, action);
        break;
      case 'convert_to_spread':
        applyConvertToSpread(tradesToModify, action, updatedTrades, availableOptions);
        break;
    }
  }
  
  return updatedTrades;
}

/**
 * Apply reduce position size action
 */
export function applyReducePositionSize(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[]
): void {
  for (const trade of trades) {
    const reductionFactor = action.parameters.reductionFactor || 0.5;
    const newQuantity = Math.max(1, Math.floor(trade.quantity * reductionFactor));
    
    if (newQuantity < trade.quantity) {
      // Create a new closed trade for the reduced portion
      const reducedQuantity = trade.quantity - newQuantity;
      
      const closedTrade: SpyTrade = {
        ...trade,
        id: `${trade.id}-closed-${Date.now()}`,
        quantity: reducedQuantity,
        status: 'closed',
        closedAt: new Date(),
        profit: (trade.currentPrice - trade.entryPrice) * reducedQuantity * 100,
        profitPercentage: ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100
      };
      
      allTrades.push(closedTrade);
      
      // Update the original trade
      trade.quantity = newQuantity;
    }
  }
}

/**
 * Apply increase position size action
 */
export function applyIncreasePositionSize(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[],
  availableOptions: SpyOption[]
): void {
  for (const trade of trades) {
    const increaseFactor = action.parameters.increaseFactor || 1.5;
    const addedQuantity = Math.floor(trade.quantity * (increaseFactor - 1));
    
    if (addedQuantity > 0) {
      // Update the original trade quantity
      trade.quantity += addedQuantity;
      
      // In a real implementation, we would need to check available capital
      // and update the average entry price
    }
  }
}

/**
 * Apply exit trade action
 */
export function applyExitTrade(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[]
): void {
  for (const trade of trades) {
    trade.status = 'closed';
    trade.closedAt = new Date();
    trade.profit = (trade.currentPrice - trade.entryPrice) * trade.quantity * 100;
    trade.profitPercentage = ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
  }
}

/**
 * Apply hedge position action
 */
export function applyHedgePosition(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[],
  availableOptions: SpyOption[],
  settings: AITradingSettings
): void {
  for (const trade of trades) {
    // Find a suitable hedge option
    const oppositeType = trade.type === 'CALL' ? 'PUT' : 'CALL';
    
    const hedgeOptions = availableOptions.filter(option => 
      option.type === oppositeType &&
      option.expirationDate.getTime() === trade.expirationDate.getTime()
    );
    
    if (hedgeOptions.length === 0) continue;
    
    // Choose a hedge option (in a real implementation, this would be more sophisticated)
    // Here we just pick the option with strike price closest to current
    const hedgeOption = hedgeOptions.sort((a, b) => 
      Math.abs(a.strikePrice - trade.strikePrice) - Math.abs(b.strikePrice - trade.strikePrice)
    )[0];
    
    // Create a new hedge trade
    const hedgeTrade: SpyTrade = {
      id: `hedge-${trade.id}-${Date.now()}`,
      optionId: hedgeOption.id,
      type: hedgeOption.type,
      strikePrice: hedgeOption.strikePrice,
      expirationDate: new Date(hedgeOption.expirationDate),
      entryPrice: hedgeOption.premium,
      currentPrice: hedgeOption.premium,
      targetPrice: hedgeOption.premium * 1.3, // Simple target
      stopLoss: hedgeOption.premium * 0.7, // Simple stop loss
      quantity: Math.max(1, Math.floor(trade.quantity * 0.5)), // Hedge with 50% of original position
      status: 'active',
      openedAt: new Date(),
      profit: 0,
      profitPercentage: 0,
      confidenceScore: 0.6
    };
    
    allTrades.push(hedgeTrade);
  }
}

/**
 * Apply adjust stop loss action
 */
export function applyAdjustStopLoss(
  trades: SpyTrade[],
  action: RiskAction
): void {
  for (const trade of trades) {
    const adjustmentFactor = action.parameters.adjustmentFactor || 0.7;
    
    // For bearish signals on CALL options or bullish signals on PUT options,
    // move stop loss closer to current price
    if ((trade.type === 'CALL' && action.parameters.signalDirection === 'bearish') ||
        (trade.type === 'PUT' && action.parameters.signalDirection === 'bullish')) {
      
      // Calculate new stop loss
      const currentGap = trade.currentPrice - trade.stopLoss;
      const newGap = currentGap * adjustmentFactor;
      trade.stopLoss = trade.currentPrice - newGap;
    }
  }
}

/**
 * Apply adjust take profit action
 */
export function applyAdjustTakeProfit(
  trades: SpyTrade[],
  action: RiskAction
): void {
  for (const trade of trades) {
    const adjustmentFactor = action.parameters.adjustmentFactor || 0.8;
    
    // For bullish signals on CALL options or bearish signals on PUT options,
    // tighten take profit level to lock in gains
    if ((trade.type === 'CALL' && action.parameters.signalDirection === 'bullish') ||
        (trade.type === 'PUT' && action.parameters.signalDirection === 'bearish')) {
      
      // If trade is profitable, move take profit closer to current price
      if (trade.currentPrice > trade.entryPrice) {
        const currentTarget = trade.targetPrice;
        const newTarget = trade.currentPrice + (currentTarget - trade.currentPrice) * adjustmentFactor;
        trade.targetPrice = newTarget;
      }
    }
  }
}

/**
 * Apply convert to spread action
 */
export function applyConvertToSpread(
  trades: SpyTrade[],
  action: RiskAction,
  allTrades: SpyTrade[],
  availableOptions: SpyOption[]
): void {
  // Implementing a spread conversion is beyond the scope of this example
  // This would involve adding a short leg to create a vertical spread
  // This is just a placeholder for demonstration
}
