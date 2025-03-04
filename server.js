
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import fs from 'fs';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Add security headers with proper CSP for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 
                   "https://sklwsxgxsqtwlqjhegms.supabase.co", 
                   "wss://*.supabase.co",
                   isProduction ? "https://spy-trader.onrender.com" : "http://localhost:10000"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://sklwsxgxsqtwlqjhegms.supabase.co", "https://*.supabase.co"],
      fontSrc: ["'self'", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Prevents clickjacking
    },
  },
  // For improved compatibility with various client setups
  crossOriginEmbedderPolicy: false,
}));

// Enhanced compression for better performance
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function from the module
    return compression.filter(req, res);
  }
}));

// Serve static files with aggressive caching strategy
const staticOptions = {
  maxAge: isProduction ? '7d' : '0', // Cache for 7 days in production
  setHeaders: (res, filePath) => {
    // Don't cache HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
    // Use versioned cache for JS and CSS (1 year)
    else if (filePath.match(/\.(js|css)$/)) {
      if (isProduction) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }
};

app.use(express.static(path.join(__dirname, 'dist'), staticOptions));

// Add request logging middleware with improved format
app.use((req, res, next) => {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const size = res.getHeader('content-length') || 0;
    const userAgent = req.headers['user-agent'] || '-';
    
    // Log format: [TIMESTAMP] METHOD PATH STATUS DURATION SIZE IP USER-AGENT
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${size} ${ip} "${userAgent}"`
    );
    
    // If it's a slow response, log it separately for monitoring
    if (duration > 1000) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
});

// Add rate limiting for production
if (isProduction) {
  // Simple in-memory rate limiter (consider using Redis for multi-server setups)
  const rateLimit = {};
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 100; // 100 requests per minute per IP
  
  app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Initialize or reset expired entries
    if (!rateLimit[ip] || now - rateLimit[ip].timestamp > WINDOW_MS) {
      rateLimit[ip] = {
        timestamp: now,
        count: 1
      };
      return next();
    }
    
    // Increment count
    rateLimit[ip].count++;
    
    // Check if over limit
    if (rateLimit[ip].count > MAX_REQUESTS) {
      return res.status(429).send('Too Many Requests');
    }
    
    next();
  });
  
  // Clean up rate limit object periodically to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimit).forEach(ip => {
      if (now - rateLimit[ip].timestamp > WINDOW_MS) {
        delete rateLimit[ip];
      }
    });
  }, WINDOW_MS);
}

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

// Enhanced health check endpoint for monitoring
app.get('/health', (req, res) => {
  const healthData = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage()
  };
  
  // Check if we can access the file system
  try {
    fs.accessSync(path.join(__dirname, 'dist', 'index.html'));
    healthData.filesystem = 'OK';
  } catch (err) {
    healthData.filesystem = 'ERROR';
    healthData.status = 'DEGRADED';
  }
  
  const statusCode = healthData.status === 'UP' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

// Handle OAuth callback for Schwab with improved logging and security
app.get('/auth/callback', (req, res) => {
  const { code, state } = req.query;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Basic validation of parameters
  if (!code || !state) {
    console.error('Invalid OAuth callback: Missing parameters', { ip });
    return res.status(400).redirect('/auth?error=invalid_callback');
  }
  
  console.log('Received OAuth callback with query params:', {
    code: code.substring(0, 5) + '...',
    state: state.substring(0, 5) + '...',
    timestamp: new Date().toISOString(),
    ip: ip.substring(0, 5) + '...' // Redact full IP for privacy
  });
  
  // Redirect to the frontend with the parameters
  const redirectUrl = `/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
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
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`Current date: ${new Date().toISOString()}`);
  console.log(`Process ID: ${process.pid}`);
});

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
