// stress.js
const fs = require('fs');
const path = require('path');
const pinoLogger = require('./pino-logger');         // Pino logger
const winstonLogger = require('./winston-logger');     // Winston logger
const { performance } = require('perf_hooks');
const { createChart } = require('./chart');            // Chart creation function

// Parameters
const USERS_MIN = 2000;
const USERS_MAX = 8000;
const LOGS_PER_USER_PER_MIN = 20;
const LOG_SIZE = 100; // characters per log

// Expected log file paths (adjust if needed)
const PINO_LOG_FILE_PATH = path.join(__dirname, 'logs', 'pino-logfile.log');
const WINSTON_LOG_FILE_PATH = path.join(__dirname, 'logs', 'winston-logfile.log');

// Arrays to store samples for Pino and Winston: { time: seconds, size: bytes }
const pinoFileSizeData = [];
const winstonFileSizeData = [];

/**
 * Sample the size of the Pino log file.
 * @param {number} startTime - The performance.now() timestamp when the test started.
 */
function samplePinoFileSize(startTime) {
  fs.stat(PINO_LOG_FILE_PATH, (err, stats) => {
    if (err) {
      console.error('Error reading Pino log file stats:', err);
      return;
    }
    const currentTime = performance.now();
    const elapsedSeconds = (currentTime - startTime) / 1000;
    pinoFileSizeData.push({ time: elapsedSeconds, size: stats.size });
  });
}

/**
 * Sample the size of the Winston log file.
 * @param {number} startTime - The performance.now() timestamp when the test started.
 */
function sampleWinstonFileSize(startTime) {
  fs.stat(WINSTON_LOG_FILE_PATH, (err, stats) => {
    if (err) {
      console.error('Error reading Winston log file stats:', err);
      return;
    }
    const currentTime = performance.now();
    const elapsedSeconds = (currentTime - startTime) / 1000;
    winstonFileSizeData.push({ time: elapsedSeconds, size: stats.size });
  });
}

/**
 * Simulate logging for a single user.
 * Returns a promise that resolves after the user writes all logs using both Pino and Winston.
 */
function logForUser(userId) {
  return new Promise((resolve) => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      // Log using Pino
      pinoLogger.info(`User ${userId}: Log entry #${count} with random text of length ${LOG_SIZE}`);
      // Log using Winston
      winstonLogger.info(`User ${userId}: Log entry #${count} with random text of length ${LOG_SIZE}`);
      if (count === LOGS_PER_USER_PER_MIN) {
        clearInterval(interval);
        resolve();
      }
    }, 3000); // Logs every 3 seconds to reach 20 logs per minute.
  });
}

/**
 * Runs the simulation for all users.
 */
async function stressTestSimulation(userCount) {
  const startTime = performance.now();
  const userPromises = [];
  for (let i = 0; i < userCount; i++) {
    userPromises.push(logForUser(i));
  }
  await Promise.all(userPromises);
  const endTime = performance.now();
  const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
  console.log(`Stress test completed with ${userCount} users in ${timeTaken.toFixed(2)} seconds`);
}

/**
 * Runs the complete stress test:
 * - Starts file size sampling for both Pino and Winston
 * - Runs the stress test simulation
 * - Stops sampling and produces the chart.
 */
async function runStressTest() {
  const userCount = Math.floor(Math.random() * (USERS_MAX - USERS_MIN + 1)) + USERS_MIN;
  console.log(`Starting stress test with ${userCount} users...`);
  const startTime = performance.now();

  // Begin sampling the log file size for both Pino and Winston every second.
  const samplingInterval = setInterval(() => {
    samplePinoFileSize(startTime);
    sampleWinstonFileSize(startTime);
  }, 1000);

  await stressTestSimulation(userCount);

  // Stop sampling once the simulation is complete.
  clearInterval(samplingInterval);

  const endTime = performance.now();
  const elapsed = endTime - startTime;
  console.log(`Total logs written: ${userCount * LOGS_PER_USER_PER_MIN}`);
  console.log(`Test completed in ${elapsed / 1000} seconds.`);

  setTimeout(async () => {
    try {
      await createChart(pinoFileSizeData, winstonFileSizeData, 'logFileSizeChart.png');
    } catch (err) {
      console.error('Error creating chart:', err);
    }
  }, 2000);
}

// Run the stress test.
runStressTest().catch((err) => console.error('Error running stress test:', err));
