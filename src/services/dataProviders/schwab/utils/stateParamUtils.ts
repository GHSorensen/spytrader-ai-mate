
/**
 * Utilities for handling OAuth state parameters
 */

/**
 * Generate a random state parameter for CSRF protection
 * Using crypto API when available for better security
 */
export function generateStateParam(): string {
  let randomString: string;

  // Use crypto API if available for more secure random values
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    randomString = Array.from(array, dec => dec.toString(36)).join('');
  } else {
    // Fallback to Math.random for environments without crypto API
    randomString = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  }
  
  // Add timestamp to make the state parameter even more unique
  const timestamp = Date.now().toString(36);
  const stateParam = `${randomString}-${timestamp}`;
  
  console.log(`[StateParamUtils] Generated state parameter: ${stateParam.substring(0, 5)}...`);
  
  return stateParam;
}

/**
 * Verify the state parameter returned by the OAuth provider
 */
export function verifyStateParam(returnedState: string, originalState: string): boolean {
  if (!returnedState || !originalState) {
    console.error(`[StateParamUtils] State parameter verification failed - missing parameters:
      - Returned state exists: ${!!returnedState}
      - Original state exists: ${!!originalState}`);
    return false;
  }
  
  console.log(`[StateParamUtils] Verifying state parameter: 
    - Returned: ${returnedState.substring(0, 5)}...
    - Original: ${originalState.substring(0, 5)}...`);
  
  const isValid = returnedState === originalState;
  
  if (isValid) {
    console.log(`[StateParamUtils] State parameter verification succeeded`);
  } else {
    console.error(`[StateParamUtils] State parameter verification failed - values don't match`);
  }
  
  return isValid;
}

/**
 * Extract timestamp from a state parameter (for expiration checks)
 * Returns null if the timestamp cannot be extracted
 */
export function extractStateTimestamp(stateParam: string): number | null {
  try {
    const parts = stateParam.split('-');
    if (parts.length < 2) return null;
    
    const timestampStr = parts[parts.length - 1];
    const timestamp = parseInt(timestampStr, 36);
    
    if (isNaN(timestamp)) return null;
    
    return timestamp;
  } catch (error) {
    console.error('[StateParamUtils] Error extracting timestamp from state parameter:', error);
    return null;
  }
}

/**
 * Check if a state parameter has expired (optional validation)
 * @param stateParam The state parameter to check
 * @param maxAgeMs Maximum age in milliseconds (default 15 minutes)
 */
export function isStateExpired(stateParam: string, maxAgeMs = 15 * 60 * 1000): boolean {
  const timestamp = extractStateTimestamp(stateParam);
  
  if (timestamp === null) {
    console.warn('[StateParamUtils] Cannot check expiration - no timestamp in state parameter');
    return false; // Cannot determine expiration, so don't invalidate
  }
  
  const now = Date.now();
  const age = now - timestamp;
  const isExpired = age > maxAgeMs;
  
  if (isExpired) {
    console.warn(`[StateParamUtils] State parameter has expired (age: ${Math.round(age / 1000)}s)`);
  }
  
  return isExpired;
}
