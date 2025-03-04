
import express from 'express';
import { setupMiddleware } from './middleware.js';
import { setupErrorHandling } from './errorHandling.js';
import { setupRoutes } from './routes.js';
import { setupHealthCheck } from './healthCheck.js';
import { setupGracefulShutdown } from './shutdown.js';

// Determine current environment
const isProduction = process.env.NODE_ENV === 'production';

// Create express application
const app = express();

// Setup middleware (security, compression, logging, etc.)
setupMiddleware(app, isProduction);

// Setup health check endpoint
setupHealthCheck(app);

// Setup routes (including auth routes and SPA fallback)
setupRoutes(app);

// Setup error handling middleware
setupErrorHandling(app, isProduction);

// Explicitly use the PORT from environment variable or default
const PORT = process.env.PORT || 10000;

// Create the server instance
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`Current date: ${new Date().toISOString()}`);
  console.log(`Process ID: ${process.pid}`);
});

// Setup graceful shutdown handlers
setupGracefulShutdown(server);

export default server;
