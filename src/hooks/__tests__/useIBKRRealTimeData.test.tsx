
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRRealTimeData } from '../useIBKRRealTimeData';
import { useIBKRConnectionStatus } from '../ibkr/useIBKRConnectionStatus';
import { useIBKRMarketData } from '../ibkr/useIBKRMarketData';
import { useIBKROptionChain } from '../ibkr/useIBKROptionChain';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createMockMarketData, createMockOptions } from '../ibkr/__tests__/useIBKRDataTestUtils';
import { logError } from '@/lib/errorMonitoring';

// Mock the hook dependencies
jest.mock('../ibkr/useIBKRConnectionStatus');
jest.mock('../ibkr/useIBKRMarketData');
jest.mock('../ibkr/useIBKROptionChain');
jest.mock('@/lib/errorMonitoring', () => ({
  logError: jest.fn(),
}));

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

  // New tests for edge cases and error handling

  test('should handle all hooks being in loading state', () => {
    (useIBKRMarketData as jest.Mock).mockReturnValue({
      marketData: null,
      isLoading: true,
      isError: false,
      lastUpdated: null,
      refetch: jest.fn(),
    });

    (useIBKROptionChain as jest.Mock).mockReturnValue({
      options: [],
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.marketData).toBeNull();
    expect(result.current.options).toEqual([]);
  });

  test('should handle all hooks being in error state', () => {
    (useIBKRMarketData as jest.Mock).mockReturnValue({
      marketData: null,
      isLoading: false,
      isError: true,
      lastUpdated: null,
      refetch: jest.fn(),
    });

    (useIBKROptionChain as jest.Mock).mockReturnValue({
      options: [],
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    expect(result.current.isError).toBe(true);
  });

  test('should handle disconnect state correctly', () => {
    (useIBKRConnectionStatus as jest.Mock).mockReturnValue({
      isConnected: false,
      dataSource: 'mock',
      connectionDiagnostics: {
        status: 'disconnected',
        lastChecked: new Date(),
        errorMessage: 'Connection failed',
      },
      checkConnection: jest.fn(),
      reconnect: jest.fn(),
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.dataSource).toBe('mock');
    expect(result.current.connectionDiagnostics.status).toBe('disconnected');
  });

  test('refreshAllData should handle errors gracefully', async () => {
    const mockMarketDataRefetch = jest.fn().mockRejectedValue(new Error('Network error'));
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
    
    // Both refetch functions should be called even if one fails
    expect(mockMarketDataRefetch).toHaveBeenCalled();
    expect(mockOptionsRefetch).toHaveBeenCalled();
    
    // Error should be logged
    expect(logError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  test('should handle delayed data source correctly', () => {
    (useIBKRConnectionStatus as jest.Mock).mockReturnValue({
      isConnected: true,
      dataSource: 'delayed',
      connectionDiagnostics: {
        status: 'connected',
        lastChecked: new Date(),
      },
      checkConnection: jest.fn(),
      reconnect: jest.fn(),
    });
    
    const { result } = renderHook(() => useIBKRRealTimeData(), { wrapper });
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.dataSource).toBe('delayed');
  });
});

