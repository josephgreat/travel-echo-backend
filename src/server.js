const http = require('node:http')
const env = require('#utils/env')
const logger = require('#utils/logger')
const { IS_PRODUCTION_ENV } = require('#utils/constants')
const PORT = env.get('PORT', 5000)
const app = require('./app')

const server = http.createServer(app)

server.listen(PORT, () => {
  logger.info(
    `Server running on ${IS_PRODUCTION_ENV ? `port ${PORT}` : `http://localhost:${PORT}`}`
  )
})

process.on('SIGINT', () => {
  server.close(() => {
    logger.info('Server closed.')
    process.exit(0)
  })
})
