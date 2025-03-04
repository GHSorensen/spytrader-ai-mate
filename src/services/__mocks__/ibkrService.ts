
import { IBKRAccount, IBKRConnectionStatus } from '@/lib/types/ibkr';

// Mock implementation of IBKR service for testing
export const getIBKRConnectionStatus = jest.fn().mockImplementation(async (): Promise<IBKRConnectionStatus> => {
  return 'connected';
});

export const getIBKRAccounts = jest.fn().mockImplementation(async (): Promise<IBKRAccount[]> => {
  return [
    {
      id: 'test-id-1',
      accountId: 'U12345678',
      accountName: 'Test Account',
      accountType: 'Individual',
      currency: 'USD',
      isPrimary: true
    }
  ];
});

export const connectToIBKR = jest.fn().mockImplementation(async (): Promise<void> => {
  return Promise.resolve();
});

export const disconnectFromIBKR = jest.fn().mockImplementation(async (): Promise<void> => {
  return Promise.resolve();
});
