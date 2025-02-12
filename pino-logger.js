// pino-logger.js
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const rfs = require('rotating-file-stream');

// Ensure the logs directory exists.
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a rotating file stream that writes to "pino-logfile.log"
// For this test, we use a static file name so that our stress.js can find it.
const logStream = rfs.createStream('pino-logfile.log', {
  interval: '7d', // rotate weekly (or adjust as needed)
  path: logDir,
  // Optionally, you can disable rotation for the test by omitting the interval.
});

// Create a Pino logger that writes to the stream.
const logger = pino({ level: 'info' }, logStream);

module.exports = logger;
