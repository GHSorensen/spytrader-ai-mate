
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRConfigManager } from '../useIBKRConfigManager';
import { clearDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { DataProviderType } from '@/lib/types/spy/dataProvider';

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
      type: 'interactive-brokers' as DataProviderType,
      apiKey: 'test-api-key',
      callbackUrl: 'https://example.com/callback',
      connectionMethod: 'webapi' as 'webapi' | 'tws',
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
