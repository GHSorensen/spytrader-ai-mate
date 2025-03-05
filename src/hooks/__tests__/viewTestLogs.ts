/**
 * Test Log Viewer Script
 * 
 * This script lists and optionally displays IBKR test log files.
 * Usage: npx ts-node src/hooks/__tests__/viewTestLogs.ts [log-file-name]
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve(__dirname, '../../../logs');

// Check if logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  console.error(`Logs directory not found: ${LOG_DIR}`);
  process.exit(1);
}

// Get log file name from command line arguments
const logFileName = process.argv[2];

// If log file specified, show its contents
if (logFileName) {
  const logFilePath = path.join(LOG_DIR, logFileName);
  
  if (!fs.existsSync(logFilePath)) {
    console.error(`Log file not found: ${logFilePath}`);
    process.exit(1);
  }
  
  console.log(`\nContents of ${logFileName}:\n`);
  console.log(fs.readFileSync(logFilePath, 'utf8'));
} 
// Otherwise, list all available log files
else {
  const logFiles = fs.readdirSync(LOG_DIR)
    .filter(file => file.startsWith('ibkr-test-results-'))
    .sort((a, b) => {
      // Sort by file creation time (newest first)
      return fs.statSync(path.join(LOG_DIR, b)).mtime.getTime() - 
             fs.statSync(path.join(LOG_DIR, a)).mtime.getTime();
    });
  
  if (logFiles.length === 0) {
    console.log('No test log files found.');
    process.exit(0);
  }
  
  console.log('\nAvailable test log files:\n');
  logFiles.forEach((file, index) => {
    const stats = fs.statSync(path.join(LOG_DIR, file));
    console.log(`${index + 1}. ${file} (${stats.mtime.toLocaleString()})`);
  });
  
  console.log('\nTo view a log file, run: npx ts-node src/hooks/__tests__/viewTestLogs.ts <log-file-name>');
}
