
import { useIBKRConnectionStatus } from '../useIBKRConnectionStatus';
import { useIBKRMarketData } from '../useIBKRMarketData';
import { useIBKROptionChain } from '../useIBKROptionChain';
import { createMockMarketData, createMockOptions } from './useIBKRDataTestUtils';

/**
 * Setup mock implementations for the IBKR hooks for testing
 */
export const setupIBKRHookMocks = () => {
  jest.clearAllMocks();
  
  // Setup default mock return values
  (useIBKRConnectionStatus as jest.Mock).mockReturnValue({
    isConnected: true,
    dataSource: 'live',
    connectionDiagnostics: {
      status: 'connected',
      lastChecked: new Date(),
    },
    checkConnection: jest.fn(),
    reconnect: jest.fn(),
  });
  
  (useIBKRMarketData as jest.Mock).mockReturnValue({
    marketData: createMockMarketData(),
    isLoading: false,
    isError: false,
    error: null,
    lastUpdated: new Date(),
    refetch: jest.fn(),
    isFetching: false,
  });
  
  (useIBKROptionChain as jest.Mock).mockReturnValue({
    options: createMockOptions(),
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isFetching: false,
  });
};

/**
 * Create a test wrapper with QueryClientProvider
 */
export const createTestQueryWrapper = () => {
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
  const React = require('react');
  
  // Setup a fresh QueryClient
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
