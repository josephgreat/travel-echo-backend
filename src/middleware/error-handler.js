const { IS_PRODUCTION_ENV } = require('../utils/constants')

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const message = IS_PRODUCTION_ENV ? 'Something went wrong' : err.message
  res.status(err.status || 500).json({ success: false, message })
}
