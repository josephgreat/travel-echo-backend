const winston = require('winston')
const path = require('path')
const DailyRotateFile = require('winston-daily-rotate-file')
const { IS_PRODUCTION_ENV } = require('../utils/constants')

const logDirectory = path.resolve('logs')

// Custom colors for log levels
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  debug: 'green'
}

winston.addColors(customColors)

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`
    })
  ),
  transports: []
})

// Add Console transport
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }), // Apply colors to all parts
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Include timestamp
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`
      })
    )
  })
)

// Add file logging with rotation in production mode
if (IS_PRODUCTION_ENV) {
  logger.add(
    new DailyRotateFile({
      filename: path.join(logDirectory, 'site-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    })
  )

  logger.add(
    new DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    })
  )
}

// Custom error handler
const originalError = logger.error
logger.error = (msg) => {
  if (msg instanceof Error) {
    originalError.call(logger, `${msg.message}\nStack: ${msg.stack}`)
  } else {
    originalError.call(logger, msg)
  }
}

module.exports = logger
