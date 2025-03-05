
# IBKR Real-Time Data Testing Tools

This directory contains tests and utilities for the IBKR real-time data hooks.

## Available Scripts

### Run Tests and Save Results

To run the tests and save the results to a log file:

```bash
npx ts-node src/hooks/__tests__/runTests.ts
```

This will create a timestamped log file in the `logs` directory at the project root.

### View Test Logs

To list all available test logs:

```bash
npx ts-node src/hooks/__tests__/viewTestLogs.ts
```

To view a specific log file:

```bash
npx ts-node src/hooks/__tests__/viewTestLogs.ts <log-file-name>
```

### Run Tests and Automatically View Results

To run the tests and automatically open the log file:

```bash
npx ts-node src/hooks/__tests__/runAndViewTests.ts
```

## Test Coverage

The tests cover the following aspects of the `useIBKRRealTimeData` hook:

1. Combined state from all dependency hooks
2. Proper loading state handling
3. Error state propagation
4. Action function behavior:
   - `refreshAllData`
   - `forceConnectionCheck`
   - `reconnect`
5. Edge cases:
   - All hooks in loading state
   - All hooks in error state
   - Disconnected state
   - Delayed data source
6. Error handling:
   - Graceful handling of refetch errors

## Future Tests

When making changes to the real-time data system, consider adding tests for:

1. New data sources
2. Modified state handling
3. Additional action functions
4. Edge cases and error handling
5. Performance optimization

