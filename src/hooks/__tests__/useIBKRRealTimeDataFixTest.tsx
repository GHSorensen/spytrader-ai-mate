
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRRealTimeData } from '../useIBKRRealTimeData';
import { useIBKRConnectionStatus } from '../ibkr/useIBKRConnectionStatus';
import { useIBKRMarketData } from '../ibkr/useIBKRMarketData';
import { useIBKROptionChain } from '../ibkr/useIBKROptionChain';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createMockMarketData, createMockOptions } from '../ibkr/__tests__/useIBKRDataTestUtils';

// Mock the hook dependencies
jest.mock('../ibkr/useIBKRConnectionStatus');
jest.mock('../ibkr/useIBKRMarketData');
jest.mock('../ibkr/useIBKROptionChain');

/**
 * Simple test to verify the fix for the symbol parameter in useIBKROptionChain
 */
describe('useIBKRRealTimeData symbol parameter fix test', () => {
  // Setup a fresh QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
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
      lastUpdated: new Date(),
      refetch: jest.fn(),
    });
    
    (useIBKROptionChain as jest.Mock).mockReturnValue({
      options: createMockOptions(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  test('should properly pass symbol parameter to useIBKROptionChain', () => {
    renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    // Verify that useIBKROptionChain was called with the correct symbol parameter
    expect(useIBKROptionChain).toHaveBeenCalledWith({ symbol: 'SPY' });
    
    // This test will pass if useIBKROptionChain receives the expected parameter
    // and fail if the parameter is missing or incorrect
  });
});
