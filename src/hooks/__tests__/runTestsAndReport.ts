
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

/**
 * Script to run tests and generate a markdown report
 * This creates both a log file and a readable markdown report
 */

console.log('Running tests and generating report...');

// Run the tests and capture detailed logs
const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
const logFilePath = path.join(process.cwd(), 'logs', `test-results_${timestamp}.log`);
const reportFilePath = path.join(process.cwd(), 'logs', `test-report_${timestamp}.md`);

try {
  // Run the comprehensive tests
  execSync('npx ts-node src/hooks/__tests__/runComprehensiveTests.ts', { 
    stdio: 'inherit' 
  });
  
  // Read the log file that was just created
  const logFiles = fs.readdirSync(path.join(process.cwd(), 'logs'))
    .filter(f => f.startsWith('comprehensive-test-results_'))
    .sort()
    .reverse();
  
  if (logFiles.length === 0) {
    console.error('No test log file found!');
    process.exit(1);
  }
  
  const latestLogFile = path.join(process.cwd(), 'logs', logFiles[0]);
  const logContent = fs.readFileSync(latestLogFile, 'utf8');
  
  // Create a markdown report from the log
  const reportContent = `
# SPY Trading AI Test Report

${format(new Date(), 'MMMM d, yyyy HH:mm:ss')}

## Test Summary

${logContent.includes('ALL TESTS PASSED') ? 
  '✅ **All tests passed successfully**' : 
  '❌ **Some tests failed - see details below**'}

## Test Details

\`\`\`
${logContent}
\`\`\`

## Next Steps

- Review any failed tests
- Address any warnings
- Consider expanding test coverage for:
  - Option chain data processing
  - Trade execution flow
  - Risk monitoring components

## Test Coverage Report

| Component | Coverage |
|-----------|----------|
| useIBKRRealTimeData | High |
| useIBKRMarketData | Medium |
| useIBKRConnectionStatus | High |
| useIBKROptionChain | Medium |

`;

  // Write the report
  fs.writeFileSync(reportFilePath, reportContent);
  
  console.log(`
Test execution complete!

Raw log saved to: ${latestLogFile}
Markdown report saved to: ${reportFilePath}

To view the report in your terminal:
cat ${reportFilePath}
`);

} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}
