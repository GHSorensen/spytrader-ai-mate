
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

/**
 * Set up health check endpoint for monitoring
 */
export function setupHealthCheck(app) {
  app.get('/health', (req, res) => {
    const healthData = {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: Date.now(),
      memory: process.memoryUsage()
    };
    
    // Check if we can access the file system
    try {
      fs.accessSync(path.join(rootDir, 'dist', 'index.html'));
      healthData.filesystem = 'OK';
    } catch (err) {
      healthData.filesystem = 'ERROR';
      healthData.status = 'DEGRADED';
    }
    
    const statusCode = healthData.status === 'UP' ? 200 : 503;
    res.status(statusCode).json(healthData);
  });
}
