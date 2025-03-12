const { rateLimit } = require('express-rate-limit')
const MongoStore = require('rate-limit-mongo')
const env = require('../utils/env')
const logger = require('../utils/logger')

const limiter = rateLimit({
  store: new MongoStore({
    uri: env.get('MONGO_URI'),
    collection: 'rate_limit',
    user: env.get('MONGO_USER'),
    password: env.get('MONGO_PASSWORD'),
    expireTimeMs: 15 * 60 * 1000,
    errorHandler: (err) => {
      logger.error(`Rate limit error: ${err.message || err}`)
    }
  }),
  max: 100,
  windowMs: 15 * 60 * 1000,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      success: false,
      message: 'Too many requests, please try again later'
    })
  }
})

module.exports = limiter
