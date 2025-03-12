const passport = require('../config/passport.config')

const authenticate = (role) => {
  return (req, res, next) => {
    passport.authenticate('jwt', (err, user) => {
      if (err) {
        res.status(401).json({
          success: false,
          message: `Authentication failed: ${err.message}`
        })
        return
      }
      if (!user) {
        res.status(401).json({ success: false, message: 'User not authorized' })
        return
      }
      if (role) {
        if (user.role?.toLowerCase() !== role.toLowerCase()) {
          res.status(403).json({ success: false, message: 'Not allowed' })
          return
        }
      }
      req.user = { ...user }
      next()
    })(req, res, next)
  }
}

module.exports = authenticate
