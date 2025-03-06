
import { ReactNode } from 'react';

export interface ConnectionDiagnostics {
  timestamp: string;
  providerType: string;
  browserInfo: {
    userAgent: string;
    language: string;
    platform: string;
    timeZone: string;
  };
  connected?: boolean;
  status?: any;
  dataSource?: 'live' | 'delayed' | 'mock';
  error?: string;
  stack?: string;
}

export interface ConnectionHistoryEvent {
  timestamp: Date;
  event: 'connected' | 'disconnected' | 'reconnect_attempt' | 'reconnect_success' | 'reconnect_failure';
  details?: string;
}

export interface ConnectionLogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

export interface UseIBKRConnectionStatusReturn {
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  connectionDiagnostics: ConnectionDiagnostics | null;
  checkConnection: () => Promise<void>;
  reconnect: () => Promise<boolean>;
  lastSuccessfulConnection: Date | null;
  lastCheckTime: Date | null;
}

export interface UseIBKRConnectionMonitorOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  onStatusChange?: (status: { isConnected: boolean; dataSource: 'live' | 'delayed' | 'mock' }) => void;
}

export interface UseIBKRConnectionMonitorReturn {
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  isReconnecting: boolean;
  reconnectAttempts: number;
  connectionLostTime: Date | null;
  connectionHistory: ConnectionHistoryEvent[];
  connectionLogs: ConnectionLogEntry[];
  handleManualReconnect: () => Promise<void>;
  forceConnectionCheck: () => Promise<void>;
  getDetailedDiagnostics: () => any;
}

// Define TestType enum to fix the type errors in the component
export enum TestType {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  MARKET_DATA = 'market-data',
  RECONNECT = 'reconnect',
  COMPREHENSIVE = 'comprehensive'
}

// Define ConnectionTestResult interface
export interface ConnectionTestResult {
  testType: TestType;
  status: 'success' | 'failure' | 'running' | 'not-run';
  message: string;
  error?: Error | null;
  timestamp: Date;
  durationMs?: number;
  details?: Record<string, any>;
}

// Interface for useIBKRConnectionTest hook
export interface UseIBKRConnectionTestReturn {
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  testConnection: () => Promise<ConnectionTestResult>;
  testAuthentication: () => Promise<ConnectionTestResult>;
  testMarketData: () => Promise<ConnectionTestResult>;
  testReconnect: () => Promise<ConnectionTestResult>;
  runComprehensiveTest: () => Promise<ConnectionTestResult[]>;
  isTestRunning: boolean;
  testResults: ConnectionTestResult[];
  getDiagnostics: () => any;
  clearTestResults: () => void;
}

// Update the return type of getDetailedDiagnostics
export interface DetailedDiagnostics {
  timestamp: string;
  browser: {
    userAgent: string;
    language: string;
    platform: string;
    timeZone: string;
  };
  connection: {
    isConnected: boolean;
    dataSource: 'live' | 'delayed' | 'mock';
    lastChecked: string;
    provider: string;
    providerStatus: any;
    reconnectAttempts: number;
    isReconnecting: boolean;
    connectionLostTime: string | null;
    lastError: string | null;
  };
  history: ConnectionHistoryEvent[];
  detailedProvider: any;
  connectionDuration?: number | null;
  connectionCheckCount?: number;
  lastSuccessfulConnection?: Date | null;
  lastCheckTime?: Date | null;
}

// Helper interface for test results filtering
export interface TestResultsGrouped {
  connection?: ConnectionTestResult;
  authentication?: ConnectionTestResult;
  'market-data'?: ConnectionTestResult;
  reconnect?: ConnectionTestResult;
}
