
/**
 * Set up graceful shutdown handlers for the server
 */
export function setupGracefulShutdown(server) {
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    // Close server
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 10s
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  });
}
