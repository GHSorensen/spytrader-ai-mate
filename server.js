
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Add security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://sklwsxgxsqtwlqjhegms.supabase.co", "wss://*.supabase.co"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://sklwsxgxsqtwlqjhegms.supabase.co"],
      fontSrc: ["'self'", "data:"],
    },
  },
  // Disable some features for improved compatibility
  crossOriginEmbedderPolicy: false,
}));

// Enable gzip compression for better performance
app.use(compression());

// Serve static files from the React app build directory with cache control
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static assets for 1 day
  setHeaders: (res, path) => {
    // Don't cache HTML files
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Something went wrong on the server. Please try again later.');
});

// Add a health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle OAuth callback for Schwab - log the query parameters and redirect to the frontend
app.get('/auth/callback', (req, res) => {
  console.log('Received OAuth callback with query params:', req.query);
  
  // Extract code and state parameters
  const { code, state } = req.query;
  
  // Redirect to the frontend with the parameters
  const redirectUrl = `/auth/callback?code=${code}&state=${state}`;
  console.log(`Redirecting to frontend: ${redirectUrl}`);
  
  res.redirect(redirectUrl);
});

// Handle Supabase auth callbacks
app.get('/auth/v1/callback', (req, res) => {
  console.log('Received Supabase callback with query params:', req.query);
  // For Supabase auth, we just need to pass through all query parameters
  res.redirect(`/auth?${new URLSearchParams(req.query).toString()}`);
});

// For any request that doesn't match a static file, send the index.html
// This is crucial for client-side routing to work properly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Explicitly use the PORT from environment variable or default to 10000 as Render expects
const PORT = process.env.PORT || 10000;

// Listen on all interfaces (0.0.0.0) which is required for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
