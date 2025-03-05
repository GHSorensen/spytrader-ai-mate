
import { 
  createClassifiedError, 
  ClassifiedError, 
  ErrorType
} from '@/lib/errorMonitoring/types/errorClassification';
import { IBKRErrorContext } from '../errorHandler';

/**
 * Specialized classifier for data-related errors (market data, options, etc.)
 */
export function classifyDataErrors(error: any, context: IBKRErrorContext): ClassifiedError | null {
  const message = error?.message || '';
  const lowerMessage = message.toLowerCase();
  
  // Market data specific errors
  if (context.method.includes('marketData') || context.method.includes('getMarketData')) {
    if (lowerMessage.includes('market data subscription')) {
      return createClassifiedError(
        'Market data subscription required. Please check your Interactive Brokers market data subscriptions.',
        ErrorType.SUBSCRIPTION_REQUIRED,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('no market data permissions')) {
      return createClassifiedError(
        'No market data permissions. Please check your Interactive Brokers market data subscriptions.',
        ErrorType.PERMISSION_DENIED,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('symbol not found') || lowerMessage.includes('unknown symbol')) {
      return createClassifiedError(
        'Symbol not found. Please check the ticker symbol.',
        ErrorType.INVALID_PARAMETERS,
        { originalError: error }
      );
    }
  }
  
  // Options chain specific errors
  if (context.method.includes('optionChain') || context.method.includes('getOptions')) {
    if (lowerMessage.includes('no options data')) {
      return createClassifiedError(
        'No options data available for this symbol.',
        ErrorType.MISSING_DATA,
        { originalError: error }
      );
    }
  }
  
  return null;
}
