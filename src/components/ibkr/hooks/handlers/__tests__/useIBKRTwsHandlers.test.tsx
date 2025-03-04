
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRTwsHandlers } from '../useIBKRTwsHandlers';
import { toast } from 'sonner';
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { clearDataProvider, getDataProvider } from '@/services/dataProviders/dataProviderFactory';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/services/dataProviders/interactiveBrokersService', () => {
  return {
    InteractiveBrokersService: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(true),
      };
    }),
  };
});

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
      connectionMethod: 'tws',
      paperTrading: false
    });
    
    expect(InteractiveBrokersService).toHaveBeenCalledWith(configArg);
    expect(clearDataProvider).toHaveBeenCalled();
    expect(getDataProvider).toHaveBeenCalled();
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connected');
    expect(mockSetIsConfigured).toHaveBeenCalledWith(true);
    expect(toast.success).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockSetIsConnecting).toHaveBeenCalledWith(false);
  });

  test('should handle connection failure', async () => {
    // Override the mock to simulate connection failure
    InteractiveBrokersService.mockImplementationOnce(() => {
      return {
        connect: jest.fn().mockResolvedValue(false),
      };
    });
    
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
    // Override the mock to simulate error
    InteractiveBrokersService.mockImplementationOnce(() => {
      return {
        connect: jest.fn().mockRejectedValue(new Error('Connection error')),
      };
    });
    
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
