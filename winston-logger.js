// winston-logger.js
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Ensure the logs directory exists.
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    // Custom format: timestamp level: message
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    // Write all logs to a single file.
    new winston.transports.File({ filename: path.join(logDir, 'winston-logfile.log') }),
    // Optionally, also log to the console.
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
  ],
});

module.exports = logger;
