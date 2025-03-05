
/**
 * Test Runner Script
 * 
 * This script runs the IBKR real-time data tests and saves the results to a log file.
 * Usage: npx ts-node src/hooks/__tests__/runTests.ts
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve(__dirname, '../../../logs');
const LOG_FILE = path.join(LOG_DIR, `ibkr-test-results-${new Date().toISOString().replace(/:/g, '-')}.log`);

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Create log file stream
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

// Log header
logStream.write(`==========================================================\n`);
logStream.write(`IBKR Real-Time Data Hook Tests - ${new Date().toISOString()}\n`);
logStream.write(`==========================================================\n\n`);

// Run the tests
console.log(`Running IBKR real-time data tests and saving results to ${LOG_FILE}...`);
const testProcess = spawn('npx', ['jest', 'useIBKRRealTimeData.test.tsx', '--verbose'], { shell: true });

// Handle test output
testProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  logStream.write(output);
});

testProcess.stderr.on('data', (data) => {
  const output = data.toString();
  console.error(output);
  logStream.write(`ERROR: ${output}\n`);
});

// Handle test completion
testProcess.on('close', (code) => {
  logStream.write(`\n==========================================================\n`);
  logStream.write(`Test process exited with code ${code}\n`);
  logStream.write(`==========================================================\n`);
  logStream.end();
  
  console.log(`Tests completed with exit code ${code}. Results saved to ${LOG_FILE}`);
});
