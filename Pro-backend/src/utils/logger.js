import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Logger class
class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorLogFile = path.join(logsDir, 'error.log');
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    fs.appendFileSync(filename, content);
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);

    // Write to main log file
    this.writeToFile(this.logFile, formattedMessage);

    // Write errors to separate error log
    if (level === LOG_LEVELS.ERROR) {
      this.writeToFile(this.errorLogFile, formattedMessage);
    }

    // Console output in development
    if (process.env.NODE_ENV !== 'production') {
      const consoleMessage = `[${new Date().toISOString()}] ${level}: ${message}`;

      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(consoleMessage, meta);
          break;
        case LOG_LEVELS.WARN:
          console.warn(consoleMessage, meta);
          break;
        case LOG_LEVELS.INFO:
          console.info(consoleMessage, meta);
          break;
        case LOG_LEVELS.DEBUG:
          console.debug(consoleMessage, meta);
          break;
        default:
          console.log(consoleMessage, meta);
      }
    }
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }
}

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;

    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });

    originalEnd.apply(this, args);
  };

  next();
};

// Create logger instance
const logger = new Logger();

export default logger;
