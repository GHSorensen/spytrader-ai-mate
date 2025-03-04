
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

// Serve static files
app.use(express.static(DIST_DIR));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Send the React app for all routes except API routes
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(DIST_DIR, 'index.html');
    
    // Check if the file exists
    if (!fs.existsSync(indexPath)) {
      console.error(`Error: index.html not found at ${indexPath}`);
      return res.status(500).send('Server configuration error: index.html not found');
    }
    
    // Read and send the index.html file
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    res.set('Cache-Control', 'no-cache');
    res.send(indexContent);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Server error while loading application');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`ENV: ${process.env.NODE_ENV || 'development'}`);
});

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
