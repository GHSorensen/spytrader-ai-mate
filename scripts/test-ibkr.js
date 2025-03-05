
#!/usr/bin/env node

/**
 * IBKR Test Runner Script
 * 
 * This script provides a simple command-line interface for running IBKR tests.
 * It can be run with `npm run test:ibkr`
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Display menu
console.log('\nIBKR Test Runner\n');
console.log('1. Run tests and save results to log');
console.log('2. Run tests and view results immediately');
console.log('3. View available test logs');
console.log('4. Exit');

// Get user selection
rl.question('\nSelect an option (1-4): ', (answer) => {
  switch(answer) {
    case '1':
      console.log('\nRunning tests and saving results...\n');
      spawn('npx', ['ts-node', 'src/hooks/__tests__/runTests.ts'], { 
        stdio: 'inherit',
        shell: true
      });
      break;
    
    case '2':
      console.log('\nRunning tests and opening results...\n');
      spawn('npx', ['ts-node', 'src/hooks/__tests__/runAndViewTests.ts'], { 
        stdio: 'inherit',
        shell: true
      });
      break;
    
    case '3':
      console.log('\nListing available test logs...\n');
      spawn('npx', ['ts-node', 'src/hooks/__tests__/viewTestLogs.ts'], { 
        stdio: 'inherit',
        shell: true
      });
      break;
    
    case '4':
      console.log('Exiting...');
      process.exit(0);
      break;
    
    default:
      console.log('Invalid option. Exiting...');
      process.exit(1);
  }
  
  rl.close();
});
