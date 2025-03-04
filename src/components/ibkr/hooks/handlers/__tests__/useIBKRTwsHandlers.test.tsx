
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRTwsHandlers } from '../useIBKRTwsHandlers';
import { toast } from 'sonner';
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { clearDataProvider, getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Create a properly typed mock for InteractiveBrokersService
const mockConnectFn = jest.fn().mockResolvedValue(true);
const MockInteractiveBrokersService = jest.fn().mockImplementation(() => {
  return {
    connect: mockConnectFn,
  };
});

// Mock the InteractiveBrokersService with our typed mock
jest.mock('@/services/dataProviders/interactiveBrokersService', () => ({
  InteractiveBrokersService: MockInteractiveBrokersService,
}));

jest.mock('@/services/dataProviders/dataProviderFactory', () => ({
  clearDataProvider: jest.fn(),
  getDataProvider: jest.fn(),
}));

describe('useIBKRTwsHandlers', () => {
  const mockNavigate = jest.fn();
  const mockSaveIBKRConfig = jest.fn();
  const mockSetIsConnecting = jest.fn();
  const mockSetConnectionStatus = jest.fn();
  const mockSetIsConfigured = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show error if twsHost is missing', async () => {
    const { result } = renderHook(() => useIBKRTwsHandlers({
      twsHost: '',
      twsPort: '7496',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    await result.current.handleTwsConnect();
    
    expect(toast.error).toHaveBeenCalled();
    expect(mockSetIsConnecting).not.toHaveBeenCalled();
  });

  test('should show error if twsPort is missing', async () => {
    const { result } = renderHook(() => useIBKRTwsHandlers({
      twsHost: '127.0.0.1',
      twsPort: '',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    await result.current.handleTwsConnect();
    
    expect(toast.error).toHaveBeenCalled();
    expect(mockSetIsConnecting).not.toHaveBeenCalled();
  });

  test('should connect to TWS successfully when all data is valid', async () => {
    // Reset the mock to return a successful connection
    mockConnectFn.mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useIBKRTwsHandlers({
      twsHost: '127.0.0.1',
      twsPort: '7496',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    await result.current.handleTwsConnect();
    
    expect(mockSetIsConnecting).toHaveBeenCalledWith(true);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connecting');
    expect(mockSaveIBKRConfig).toHaveBeenCalled();
    
    // The config object passed should match expected format
    const configArg = mockSaveIBKRConfig.mock.calls[0][0];
    expect(configArg).toEqual({
      type: 'interactive-brokers',
      twsHost: '127.0.0.1',
      twsPort: '7496',
      connectionMethod: 'tws' as 'webapi' | 'tws',
      paperTrading: false
    });
    
    expect(MockInteractiveBrokersService).toHaveBeenCalledWith(configArg);
    expect(clearDataProvider).toHaveBeenCalled();
    expect(getDataProvider).toHaveBeenCalled();
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connected');
    expect(mockSetIsConfigured).toHaveBeenCalledWith(true);
    expect(toast.success).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockSetIsConnecting).toHaveBeenCalledWith(false);
  });

  test('should handle connection failure', async () => {
    // Reset the mock to return a failed connection
    mockConnectFn.mockResolvedValueOnce(false);
    
    const { result } = renderHook(() => useIBKRTwsHandlers({
      twsHost: '127.0.0.1',
      twsPort: '7496',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    await result.current.handleTwsConnect();
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('error');
    expect(toast.error).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsConnecting).toHaveBeenCalledWith(false);
  });

  test('should handle connection errors', async () => {
    // Reset the mock to throw an error
    mockConnectFn.mockRejectedValueOnce(new Error('Connection error'));
    
    const { result } = renderHook(() => useIBKRTwsHandlers({
      twsHost: '127.0.0.1',
      twsPort: '7496',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    await result.current.handleTwsConnect();
    
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('error');
    expect(toast.error).toHaveBeenCalled();
    expect(mockSetIsConnecting).toHaveBeenCalledWith(false);
  });
});
