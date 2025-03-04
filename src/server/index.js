
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import fs from 'fs';

// Import modules
import { setupMiddleware } from './middleware.js';
import { setupErrorHandling } from './errorHandling.js';
import { setupHealthCheck } from './healthCheck.js';
import { setupRoutes } from './routes.js';
import { setupShutdown } from './shutdown.js';

// Convert import.meta.url to directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 10000;
const DIST_DIR = path.resolve(__dirname, '../../dist');

// Verify dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error(`Error: Build directory ${DIST_DIR} does not exist. Please run the build command first.`);
  process.exit(1);
}

// Create Express app
const app = express();

// Gzip compression
app.use(compression());

// Security headers with CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://sklwsxgxsqtwlqjhegms.supabase.co"],
        connectSrc: [
          "'self'",
          "https://sklwsxgxsqtwlqjhegms.supabase.co",
          "wss://sklwsxgxsqtwlqjhegms.supabase.co"
        ],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Setup middleware
setupMiddleware(app);

// Setup health check endpoint
setupHealthCheck(app);

// Setup routes for serving the SPA
setupRoutes(app, DIST_DIR);

// Setup error handling
setupErrorHandling(app);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`ENV: ${process.env.NODE_ENV || 'development'}`);
});

// Setup graceful shutdown
setupShutdown(server);

export default app;
