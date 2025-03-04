
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

/**
 * Set up all routes for the Express application
 */
export function setupRoutes(app) {
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
    res.sendFile(path.join(rootDir, 'dist', 'index.html'));
  });
}
