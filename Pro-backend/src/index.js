import 'dotenv/config';
import http, { createServer } from 'http';
import app from './app.js';
import logger from './utils/logger.js';

let server = createServer(app);

let Port = process.env.PORT || 5000;

server.listen(Port, () => {
  const message = `🚀 Server is running on port ${Port}`;
  console.log(message);
  logger.info(message, {
    port: Port,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
