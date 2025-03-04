
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRConfig } from '../useIBKRConfig';

describe('useIBKRConfig', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useIBKRConfig());
    
    expect(result.current.apiMethod).toBe('webapi');
    expect(result.current.apiKey).toBe('');
    expect(result.current.callbackUrl).toContain('/auth/ibkr/callback');
    expect(result.current.twsHost).toBe('127.0.0.1');
    expect(result.current.twsPort).toBe('7496');
    expect(result.current.isPaperTrading).toBe(false);
    expect(result.current.isConfigured).toBe(false);
  });

  test('should load saved webapi config from localStorage', () => {
    const mockConfig = {
      connectionMethod: 'webapi',
      apiKey: 'test-api-key',
      callbackUrl: 'https://example.com/callback',
      paperTrading: true
    };
    
    localStorage.setItem('ibkr-config', JSON.stringify(mockConfig));
    
    const { result } = renderHook(() => useIBKRConfig());
    
    expect(result.current.apiMethod).toBe('webapi');
    expect(result.current.apiKey).toBe('test-api-key');
    expect(result.current.callbackUrl).toBe('https://example.com/callback');
    expect(result.current.isPaperTrading).toBe(true);
    expect(result.current.isConfigured).toBe(true);
  });

  test('should load saved tws config from localStorage', () => {
    const mockConfig = {
      connectionMethod: 'tws',
      twsHost: '192.168.1.1',
      twsPort: '4321',
      paperTrading: true
    };
    
    localStorage.setItem('ibkr-config', JSON.stringify(mockConfig));
    
    const { result } = renderHook(() => useIBKRConfig());
    
    expect(result.current.apiMethod).toBe('tws');
    expect(result.current.twsHost).toBe('192.168.1.1');
    expect(result.current.twsPort).toBe('4321');
    expect(result.current.isPaperTrading).toBe(true);
    expect(result.current.isConfigured).toBe(true);
  });

  test('should update state when setters are called', () => {
    const { result } = renderHook(() => useIBKRConfig());
    
    act(() => {
      result.current.setApiMethod('tws');
    });
    expect(result.current.apiMethod).toBe('tws');
    
    act(() => {
      result.current.setApiKey('new-api-key');
    });
    expect(result.current.apiKey).toBe('new-api-key');
    
    act(() => {
      result.current.setCallbackUrl('new-callback-url');
    });
    expect(result.current.callbackUrl).toBe('new-callback-url');
    
    act(() => {
      result.current.setTwsHost('new-host');
    });
    expect(result.current.twsHost).toBe('new-host');
    
    act(() => {
      result.current.setTwsPort('9999');
    });
    expect(result.current.twsPort).toBe('9999');
    
    act(() => {
      result.current.setIsPaperTrading(true);
    });
    expect(result.current.isPaperTrading).toBe(true);
    
    act(() => {
      result.current.setIsConfigured(true);
    });
    expect(result.current.isConfigured).toBe(true);
  });

  test('should handle malformed JSON in localStorage', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('ibkr-config', 'not-valid-json');
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useIBKRConfig());
    
    // Should use default values when localStorage data is invalid
    expect(result.current.apiMethod).toBe('webapi');
    expect(result.current.apiKey).toBe('');
    expect(result.current.isConfigured).toBe(false);
    
    // Should log an error
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});
