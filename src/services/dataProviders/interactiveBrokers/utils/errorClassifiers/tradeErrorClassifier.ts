
import { 
  ClassifiedError, 
  ErrorType
} from '@/lib/errorMonitoring/types/errorClassification';
import { createClassifiedError } from '@/lib/errorMonitoring/utils/errorClassifier';
import { IBKRErrorContext } from '../errorHandler';

/**
 * Specialized classifier for trade execution errors
 */
export function classifyTradeErrors(error: any, context: IBKRErrorContext): ClassifiedError | null {
  const message = error?.message || '';
  const lowerMessage = message.toLowerCase();
  
  // Trade execution specific errors
  if (context.method.includes('placeTrade') || context.method.includes('executeTrade')) {
    if (lowerMessage.includes('insufficient funds') || lowerMessage.includes('buying power')) {
      return createClassifiedError(
        'Insufficient funds to execute this trade.',
        ErrorType.PERMISSION_DENIED,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('invalid order')) {
      return createClassifiedError(
        'Invalid order parameters. Please check your trade details.',
        ErrorType.INVALID_PARAMETERS,
        { originalError: error }
      );
    }
    
    if (lowerMessage.includes('market closed') || lowerMessage.includes('outside trading hours')) {
      return createClassifiedError(
        'Market is closed. This order will be submitted when the market opens.',
        ErrorType.API_ERROR,
        { originalError: error }
      );
    }
  }
  
  return null;
}
