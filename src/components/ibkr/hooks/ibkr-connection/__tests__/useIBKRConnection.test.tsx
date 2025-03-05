
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRConnection } from '../useIBKRConnection';
import { connectToIBKR, disconnectFromIBKR } from '@/services/ibkrService';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('@/services/ibkrService');
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}));
jest.mock('../useIBKRConnectionMonitoring', () => ({
  useIBKRConnectionMonitoring: jest.fn().mockReturnValue({
    isMonitoring: false,
    lastChecked: null,
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    checkConnectionStatus: jest.fn().mockResolvedValue('connected'),
  }),
}));

describe('useIBKRConnection', () => {
  const mockToast = jest.fn();
  
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => useIBKRConnection());
    
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should connect to IBKR successfully', async () => {
    const { result } = renderHook(() => useIBKRConnection());
    
    (connectToIBKR as jest.Mock).mockResolvedValue(undefined);
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.connectionStatus).toBe('connected');
    expect(connectToIBKR).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalled();
  });

  test('should handle connection failure', async () => {
    const { result } = renderHook(() => useIBKRConnection());
    
    const error = new Error('Connection failed');
    (connectToIBKR as jest.Mock).mockRejectedValue(error);
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.connectionStatus).toBe('error');
    expect(result.current.error).toBe('Connection failed');
    expect(mockToast).toHaveBeenCalled();
  });

  test('should disconnect from IBKR successfully', async () => {
    const { result } = renderHook(() => useIBKRConnection());
    
    // Set initial state as connected
    act(() => {
      result.current.setConnectionStatus('connected');
    });
    
    (disconnectFromIBKR as jest.Mock).mockResolvedValue(undefined);
    
    await act(async () => {
      await result.current.disconnect();
    });
    
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(disconnectFromIBKR).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalled();
  });

  test('should handle disconnection failure', async () => {
    const { result } = renderHook(() => useIBKRConnection());
    
    // Set initial state as connected
    act(() => {
      result.current.setConnectionStatus('connected');
    });
    
    const error = new Error('Disconnection failed');
    (disconnectFromIBKR as jest.Mock).mockRejectedValue(error);
    
    await act(async () => {
      await result.current.disconnect();
    });
    
    expect(result.current.error).toBe('Disconnection failed');
    expect(mockToast).toHaveBeenCalled();
  });
});
