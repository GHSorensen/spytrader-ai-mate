
/**
 * Helper to check if TWS is likely running
 */
export const checkIfTwsIsRunning = async (host: string, port: string): Promise<boolean> => {
  try {
    // In a real implementation, we would attempt a connection to the specified host and port
    // For now, just simulate a check with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Randomly return true/false for testing
    // In production, this would be a real check
    return Math.random() > 0.3;
  } catch (error) {
    console.error("Error checking if TWS is running:", error);
    return false;
  }
};
