
/**
 * Configure error handling middleware for the Express application
 */
export function setupErrorHandling(app, isProduction) {
  // Error handling middleware with improved details
  app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const errorId = Math.random().toString(36).substring(2, 15);
    
    // Log error with ID for tracking
    console.error(`[${timestamp}] ERROR ID:${errorId}:`, err);
    
    // Send appropriate response based on environment
    if (isProduction) {
      res.status(500).send(`
        <html>
          <head><title>Something went wrong</title></head>
          <body>
            <h1>Something went wrong</h1>
            <p>Our team has been notified. If you need immediate assistance, please contact support.</p>
            <p>Error ID: ${errorId}</p>
          </body>
        </html>
      `);
    } else {
      // In development, include error details
      res.status(500).send(`
        <html>
          <head><title>Development Error</title></head>
          <body>
            <h1>Development Error</h1>
            <p>Error ID: ${errorId}</p>
            <pre>${err.stack}</pre>
          </body>
        </html>
      `);
    }
  });
}
