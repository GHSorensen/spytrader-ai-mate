
import { classifyTwsErrors } from './twsErrorClassifier';
import { classifyWebApiErrors } from './webApiErrorClassifier';
import { classifyDataErrors } from './dataErrorClassifier';
import { classifyTradeErrors } from './tradeErrorClassifier';
import { IBKRErrorContext } from '../errorHandler';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

/**
 * Runs all specialized IBKR error classifiers
 * Returns the first matching classification or null if none match
 */
export function classifyIBKRErrorWithSpecializers(error: any, context: IBKRErrorContext): ClassifiedError | null {
  // Run through all specialized classifiers
  return (
    classifyTwsErrors(error, context) || 
    classifyWebApiErrors(error, context) || 
    classifyDataErrors(error, context) ||
    classifyTradeErrors(error, context)
  );
}

export {
  classifyTwsErrors,
  classifyWebApiErrors,
  classifyDataErrors,
  classifyTradeErrors
};
