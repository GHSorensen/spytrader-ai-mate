
/**
 * Utilities for handling OAuth state parameters
 */

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateStateParam(): string {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
  console.log(`[StateParamUtils] Generated state parameter: ${randomString.substring(0, 5)}...`);
  return randomString;
}

/**
 * Verify the state parameter returned by the OAuth provider
 */
export function verifyStateParam(returnedState: string, originalState: string): boolean {
  console.log(`[StateParamUtils] Verifying state parameter: 
    - Returned: ${returnedState.substring(0, 5)}...
    - Original: ${originalState.substring(0, 5)}...`);
  
  const isValid = returnedState === originalState;
  console.log(`[StateParamUtils] State parameter verification ${isValid ? 'succeeded' : 'failed'}`);
  
  return isValid;
}
