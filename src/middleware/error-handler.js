//const { IS_PRODUCTION_ENV } = require('#utils/constants')

const logger = require('#utils/logger')

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (!(err instanceof Error)) {
    err = new Error(
      typeof err === 'string' ? err : 'An unexpected error occurred'
    )
  }
  logger.error(
    `${err.name || 'UNKNOWN_ERROR'}\nMessage: ${err.message}\nStack: ${err.stack}`
  )

  const status = err.status ?? 500
  const data = err.data

  let message = err.message || err

 /*  let message =
    status >= 500 && IS_PRODUCTION_ENV
      ? "Something went wrong and we're working on it. Please try again later."
      : err.message */

  res.status(status).json({
    success: false,
    message,
    ...(data ? { data } : {})
  })
}
