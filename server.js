
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import fs from 'fs';

// Convert import.meta.url to directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 10000;
const DIST_DIR = path.resolve(__dirname, './dist');

// Create Express app
const app = express();

// Verify dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error(`Error: Build directory ${DIST_DIR} does not exist. 
  Current directory: ${__dirname}
  Files in current directory: ${fs.readdirSync(__dirname).join(', ')}`);
  
  // In production, we should continue even if dist doesn't exist yet (it might be created later)
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Gzip compression
app.use(compression());

// Security headers with CSP configuration
// Updated CSP to allow connections to render.com, IBKR, and Schwab
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://sklwsxgxsqtwlqjhegms.supabase.co", "https://*.render.com"],
        connectSrc: [
          "'self'",
          "https://sklwsxgxsqtwlqjhegms.supabase.co",
          "wss://sklwsxgxsqtwlqjhegms.supabase.co",
          "https://*.interactivebrokers.com",
          "https://*.schwab.com",
          "https://*.render.com"
        ],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    // Disable the default HSTS to avoid issues during deployment
    strictTransportSecurity: false,
  })
);

// Enhanced logging for debugging in production
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files with caching
app.use(express.static(DIST_DIR, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    build: fs.existsSync(DIST_DIR) ? 'exists' : 'missing'
  });
});

// Send the React app for all routes except API routes
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(DIST_DIR, 'index.html');
    
    // Check if the file exists
    if (!fs.existsSync(indexPath)) {
      console.error(`Error: index.html not found at ${indexPath}. 
      Available files: ${fs.readdirSync(DIST_DIR).join(', ')}`);
      return res.status(404).send('Application files not found. The site may still be building.');
    }
    
    // Read and send the index.html file
    res.sendFile(indexPath);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Server error while loading application. Please try again later.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error. Please try again later.');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});

// Increase timeouts to prevent premature disconnections
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds (slightly higher than keepAliveTimeout)

// Setup graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
