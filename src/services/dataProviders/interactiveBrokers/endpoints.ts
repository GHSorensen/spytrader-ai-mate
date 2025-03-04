
// Interactive Brokers API endpoints
// Updated based on official documentation at:
// https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/

// Base URLs
export const API_BASE_URL = "https://api.interactivebrokers.com/v1";
export const AUTH_BASE_URL = "https://www.interactivebrokers.com";

// Client Portal API Endpoints
export const ACCOUNT_ENDPOINT = "/portal/account";
export const PORTFOLIO_ENDPOINT = "/portal/portfolio";
export const POSITIONS_ENDPOINT = "/portal/positions";
export const TRADES_ENDPOINT = "/portal/trades";
export const ORDERS_ENDPOINT = "/portal/orders";
export const MARKET_DATA_ENDPOINT = "/portal/marketdata";
export const OPTIONS_ENDPOINT = "/portal/options";
export const AUTH_ENDPOINT = "/oauth/token";

// OAuth Endpoints
export const CLIENT_PORTAL_URL = "https://www.interactivebrokers.com/sso/Login";
export const OAUTH_TOKEN_URL = "https://api.interactivebrokers.com/v1/oauth/token";

// Client portal API gateway endpoints
export const TICKLE_ENDPOINT = "/tickle";
export const SSO_VALIDATE_ENDPOINT = "/sso/validate";
export const PORTFOLIO_ACCOUNTS_ENDPOINT = "/portfolio/accounts";
export const PORTFOLIO_SUBACCOUNTS_ENDPOINT = "/portfolio/subaccounts";

// WebSocket endpoints
export const WS_BASE_URL = "wss://api.interactivebrokers.com/v1/ws";
export const MARKET_DATA_WS_ENDPOINT = "/marketdata";
