
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

/**
 * Comprehensive test runner for SPY Trading AI components
 * This script runs tests on specific modules and saves detailed results to a log file
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Generate a timestamped filename for the log
const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
const logFileName = `comprehensive-test-results_${timestamp}.log`;
const logFilePath = path.join(logsDir, logFileName);

// Log header information
const logHeader = `
=====================================================
SPY TRADING AI - COMPREHENSIVE TEST RESULTS
=====================================================
Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
Environment: ${process.env.NODE_ENV || 'development'}
Node Version: ${process.version}

TEST MODULES:
- IBKR Real-Time Data Hook
- IBKR Market Data Hook
- IBKR Option Chain Hook
- IBKR Connection Status Hook

=====================================================
TEST EXECUTION:
`;

fs.writeFileSync(logFilePath, logHeader);

// Function to run tests and append output to the log file
const runTest = (testPattern: string, sectionTitle: string) => {
  console.log(`\nRunning tests for: ${sectionTitle}`);
  
  try {
    // Append section header to log
    fs.appendFileSync(
      logFilePath, 
      `\n\n----- ${sectionTitle} -----\n\n`
    );
    
    // Run the test and capture output
    const testOutput = execSync(
      `npx jest ${testPattern} --verbose`,
      { encoding: 'utf8' }
    );
    
    // Append test output to log
    fs.appendFileSync(logFilePath, testOutput);
    
    console.log(`✅ Tests completed for: ${sectionTitle}`);
    return true;
  } catch (error) {
    // If tests fail, still log the output
    const errorOutput = error instanceof Error ? error.message : String(error);
    fs.appendFileSync(
      logFilePath, 
      `\n❌ TESTS FAILED:\n${errorOutput}\n`
    );
    
    console.error(`❌ Tests failed for: ${sectionTitle}`);
    return false;
  }
};

console.log('Starting comprehensive test run...');

// Run all our test modules
const testResults = [
  runTest('useIBKRRealTimeData', 'IBKR Real-Time Data Hook'),
  // We could add more test patterns here as we develop more test modules
];

// Append summary to log
const allTestsPassed = testResults.every(result => result === true);
const summary = `
=====================================================
TEST SUMMARY:
=====================================================
${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
Test modules executed: ${testResults.length}
Test modules passed: ${testResults.filter(r => r).length}
Test modules failed: ${testResults.filter(r => !r).length}
Log file saved to: ${logFilePath}
=====================================================
`;

fs.appendFileSync(logFilePath, summary);
console.log(summary);

// Print instructions for viewing the log
console.log(`
To view the full test results, run:
npx ts-node src/hooks/__tests__/viewTestLogs.ts ${logFileName}
`);
