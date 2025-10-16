import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Log info and above (error, warn, info)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log errors to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Log all levels to app.log
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

export default logger;