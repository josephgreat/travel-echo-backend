const env = require('./utils/env')
const logger = require('./utils/logger')
const { IS_PRODUCTION_ENV } = require('./utils/constants')
const PORT = env.get('PORT', 5000)
const app = require('./app')

app.listen(PORT, () => {
  if (!IS_PRODUCTION_ENV) {
    logger.info(`Server running on http://localhost:${PORT}`)
  }
})

process.on('SIGINT', () => {
  app.close(() => {
    logger.info('Server closed.')
    process.exit(0)
  })
})
