
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

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
});
