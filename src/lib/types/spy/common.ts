
// Common type definitions used across the SPY options trading system
export type OptionType = 'CALL' | 'PUT';
export type OptionExpiry = 'daily' | 'weekly' | 'monthly';
export type TradeStatus = 'pending' | 'active' | 'closed' | 'cancelled';
export type RiskToleranceType = 'conservative' | 'moderate' | 'aggressive';
export type MarketCondition = 'bullish' | 'bearish' | 'neutral' | 'volatile';
export type TimeOfDayPreference = 'market-open' | 'midday' | 'market-close' | 'any';
export type TimeFrame = '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'ytd' | 'all';
