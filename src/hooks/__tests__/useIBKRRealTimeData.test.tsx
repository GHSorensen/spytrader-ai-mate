
import { renderHook, act } from '@testing-library/react-hooks';
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

describe('useIBKRRealTimeData', () => {
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

  test('should return combined state from all hooks', () => {
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    expect(result.current).toEqual({
      // Data
      marketData: expect.any(Object),
      options: expect.any(Array),
      
      // Status
      isConnected: true,
      dataSource: 'live',
      connectionDiagnostics: expect.any(Object),
      isLoading: false,
      isError: false,
      
      // Actions
      refreshAllData: expect.any(Function),
      forceConnectionCheck: expect.any(Function),
      reconnect: expect.any(Function),
      
      // Timestamps
      lastUpdated: expect.any(Date)
    });
  });

  test('should properly combine loading states', () => {
    (useIBKRMarketData as jest.Mock).mockReturnValue({
      marketData: null,
      isLoading: true,
      isError: false,
      lastUpdated: null,
      refetch: jest.fn(),
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
  });

  test('should properly combine error states', () => {
    (useIBKROptionChain as jest.Mock).mockReturnValue({
      options: [],
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    expect(result.current.isError).toBe(true);
  });

  test('refreshAllData should call refetch on all data hooks', async () => {
    const mockMarketDataRefetch = jest.fn();
    const mockOptionsRefetch = jest.fn();
    
    (useIBKRMarketData as jest.Mock).mockReturnValue({
      marketData: createMockMarketData(),
      isLoading: false,
      isError: false,
      lastUpdated: new Date(),
      refetch: mockMarketDataRefetch,
    });
    
    (useIBKROptionChain as jest.Mock).mockReturnValue({
      options: createMockOptions(),
      isLoading: false,
      isError: false,
      refetch: mockOptionsRefetch,
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    await act(async () => {
      await result.current.refreshAllData();
    });
    
    expect(mockMarketDataRefetch).toHaveBeenCalled();
    expect(mockOptionsRefetch).toHaveBeenCalled();
  });

  test('forceConnectionCheck should call checkConnection', () => {
    const mockCheckConnection = jest.fn();
    
    (useIBKRConnectionStatus as jest.Mock).mockReturnValue({
      isConnected: true,
      dataSource: 'live',
      connectionDiagnostics: {},
      checkConnection: mockCheckConnection,
      reconnect: jest.fn(),
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    act(() => {
      result.current.forceConnectionCheck();
    });
    
    expect(mockCheckConnection).toHaveBeenCalled();
  });

  test('reconnect should call the reconnect function', () => {
    const mockReconnect = jest.fn();
    
    (useIBKRConnectionStatus as jest.Mock).mockReturnValue({
      isConnected: false,
      dataSource: 'mock',
      connectionDiagnostics: {},
      checkConnection: jest.fn(),
      reconnect: mockReconnect,
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    act(() => {
      result.current.reconnect();
    });
    
    expect(mockReconnect).toHaveBeenCalled();
  });
});
