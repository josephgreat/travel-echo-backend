const winston = require('winston')
const path = require('path')
const fs = require('fs')
const { IS_PRODUCTION_ENV } = require('../utils/constants')

const logDirectory = path.resolve('logs')

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true })
}
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
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`
        }),
        winston.format.colorize({ all: true })
      )
    }),

    IS_PRODUCTION_ENV
      ? new winston.transports.File({
          filename: path.join(logDirectory, 'site.log'),
          maxsize: '20m',
          maxFiles: 14
        })
      : false
  ].filter(Boolean)
})

module.exports = logger
