const mongoose = require('mongoose')
const logger = require('../utils/logger')
const env = require('../utils/env')

const initializeDatabase = () => {
  mongoose
    .connect(env.get('MONGO_URI'))
    .then(() => {
      logger.info('MongoDB connection established')
    })
    .catch((err) => {
      logger.error(`MongoDB Connection Error: ${err.message}`)
    })
}

module.exports = initializeDatabase
