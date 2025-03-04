
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

/**
 * Configure and set up all middleware for the Express application
 */
export function setupMiddleware(app, isProduction) {
  // Add security headers with proper CSP for production
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 
                     "https://sklwsxgxsqtwlqjhegms.supabase.co", 
                     "wss://*.supabase.co",
                     isProduction ? "https://spy-trader.onrender.com" : "http://localhost:10000"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
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

  app.use(express.static(path.join(rootDir, 'dist'), staticOptions));

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
    setupRateLimiting(app);
  }
}

/**
 * Set up rate limiting for production environments
 */
function setupRateLimiting(app) {
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
