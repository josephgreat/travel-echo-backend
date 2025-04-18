const passport = require('#config/passport.config')

const authenticate = () => {
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
        res
          .status(401)
          .json({ success: false, message: 'Not authorized. Please, sign in' })
        return
      }
      req.user = { ...user }
      next()
    })(req, res, next)
  }
}

module.exports = authenticate
