
/**
 * Generate a random state parameter for CSRF protection in OAuth flow
 */
export function generateStateParam(): string {
  // Generate a random string of 32 characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let result = '';
  
  // Create a Uint8Array for randomness
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  // Convert to string
  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomValues[i] % characters.length);
  }
  
  return result;
}

/**
 * Verify the state parameter returned by the OAuth provider
 */
export function verifyStateParam(returnedState: string, originalState: string): boolean {
  if (!returnedState || !originalState) {
    return false;
  }
  
  // Simple string comparison for state validation
  return returnedState === originalState;
}
