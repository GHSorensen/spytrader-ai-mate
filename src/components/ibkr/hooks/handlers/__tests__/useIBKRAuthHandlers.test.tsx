
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRAuthHandlers } from '../useIBKRAuthHandlers';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = { ...originalLocation, href: '' };

describe('useIBKRAuthHandlers', () => {
  const mockNavigate = jest.fn();
  const mockSaveIBKRConfig = jest.fn();
  const mockSetIsConnecting = jest.fn();
  const mockSetConnectionStatus = jest.fn();
  const mockSetIsConfigured = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    window.location = originalLocation;
  });

  test('should navigate back to dashboard', () => {
    const { result } = renderHook(() => useIBKRAuthHandlers({
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    result.current.handleBackToDashboard();
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should show error if apiKey is missing', () => {
    const { result } = renderHook(() => useIBKRAuthHandlers({
      apiKey: '',
      callbackUrl: 'http://localhost:3000/callback',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    result.current.handleStartAuth();
    
    expect(toast.error).toHaveBeenCalled();
    expect(mockSetIsConnecting).not.toHaveBeenCalled();
  });

  test('should show error if callbackUrl is missing', () => {
    const { result } = renderHook(() => useIBKRAuthHandlers({
      apiKey: 'test-key',
      callbackUrl: '',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    result.current.handleStartAuth();
    
    expect(toast.error).toHaveBeenCalled();
    expect(mockSetIsConnecting).not.toHaveBeenCalled();
  });

  test('should start auth process when all data is valid', async () => {
    const { result } = renderHook(() => useIBKRAuthHandlers({
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      isPaperTrading: false,
      setIsConnecting: mockSetIsConnecting,
      setConnectionStatus: mockSetConnectionStatus,
      setIsConfigured: mockSetIsConfigured,
      saveIBKRConfig: mockSaveIBKRConfig,
      navigate: mockNavigate
    }));
    
    await result.current.handleStartAuth();
    
    expect(mockSetIsConnecting).toHaveBeenCalledWith(true);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith('connecting');
    expect(mockSaveIBKRConfig).toHaveBeenCalled();
    
    // The config object passed should match expected format
    const configArg = mockSaveIBKRConfig.mock.calls[0][0];
    expect(configArg).toEqual({
      type: 'interactive-brokers',
      apiKey: 'test-key',
      callbackUrl: 'http://localhost:3000/callback',
      connectionMethod: 'webapi',
      paperTrading: false
    });
    
    // Should have attempted to redirect to auth URL
    expect(window.location.href).not.toBe('');
  });
});
