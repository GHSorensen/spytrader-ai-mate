
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRConfigManager } from '../useIBKRConfigManager';
import { clearDataProvider } from '@/services/dataProviders/dataProviderFactory';

// Mock the dependencies
jest.mock('@/services/dataProviders/dataProviderFactory', () => ({
  clearDataProvider: jest.fn(),
}));

describe('useIBKRConfigManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should save config to localStorage', () => {
    const { result } = renderHook(() => useIBKRConfigManager());
    
    const mockConfig = {
      type: 'interactive-brokers',
      apiKey: 'test-api-key',
      callbackUrl: 'https://example.com/callback',
      connectionMethod: 'webapi',
      paperTrading: false
    };
    
    result.current.saveIBKRConfig(mockConfig);
    
    // Check localStorage was updated
    const savedConfig = localStorage.getItem('ibkr-config');
    expect(savedConfig).toBe(JSON.stringify(mockConfig));
    
    // Check that provider was cleared
    expect(clearDataProvider).toHaveBeenCalled();
  });
});
