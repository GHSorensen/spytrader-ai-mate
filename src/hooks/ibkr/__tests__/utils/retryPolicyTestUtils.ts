
import { logError } from '@/lib/errorMonitoring';

// Mock the error logging
jest.mock('@/lib/errorMonitoring', () => ({
  logError: jest.fn(),
}));

/**
 * Common test setup utilities for retry policy tests
 */
export const setupRetryPolicyTest = () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
};

/**
 * Creates network errors with optional status code
 */
export const createTestError = (message: string, status?: number): Error => {
  const error = new Error(message);
  if (status) {
    (error as any).status = status;
  }
  return error;
};
