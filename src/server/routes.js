
/**
 * Server route configuration
 */

import path from 'path';
import fs from 'fs';

export function setupRoutes(app, distDir) {
  // Send the React app for all routes except API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    try {
      const indexPath = path.join(distDir, 'index.html');
      
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
}
