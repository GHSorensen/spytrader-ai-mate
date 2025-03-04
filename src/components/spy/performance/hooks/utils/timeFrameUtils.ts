
import { TimeFrame } from '@/lib/types/spy';

/**
 * Helper function to determine how many months to show based on time frame
 */
export const getMonthsForTimeFrame = (tf: TimeFrame): number => {
  switch (tf) {
    case '1d':
    case '1w':
      return 1;
    case '1m':
      return 3;
    case '3m':
      return 6;
    case '6m':
      return 9;
    case '1y':
      return 12;
    case 'ytd':
      return new Date().getMonth() + 1; // Current month index + 1
    case 'all':
    default:
      return 24; // Show all available data
  }
};
