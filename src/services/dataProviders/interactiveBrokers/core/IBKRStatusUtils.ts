
import { DataProviderStatus } from "@/lib/types/spy/dataProvider";

/**
 * Utility functions for IBKR status management
 */
export const createErrorStatus = (error: unknown): DataProviderStatus => {
  return {
    connected: false,
    lastUpdated: new Date(),
    errorMessage: error instanceof Error ? error.message : "Unknown error"
  };
};

export const createDisconnectedStatus = (): DataProviderStatus => {
  return {
    connected: false,
    lastUpdated: new Date()
  };
};

export const createConnectedStatus = (quotesDelayed: boolean = false): DataProviderStatus => {
  return {
    connected: true,
    lastUpdated: new Date(),
    quotesDelayed
  };
};
