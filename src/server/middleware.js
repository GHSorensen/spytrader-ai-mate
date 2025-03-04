
/**
 * Server middleware configuration
 */

import express from 'express';
import path from 'path';

export function setupMiddleware(app) {
  // Enable JSON body parsing
  app.use(express.json());
  
  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  
  // Log all requests
  app.use((req, res, next) => {
    // Skip logging for static assets to reduce noise
    if (!req.path.includes('.')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });
  
  // Serve static files from the React app build directory
  app.use(express.static(path.resolve('./dist'), {
    maxAge: '1y',
    etag: true,
    index: false
  }));
}
