const passport = require('#config/passport.config')

const signInWithGoogle = () => {
  return passport.authenticate('google', { scope: ['profile', 'email'] })
}

const googleAuthCallback = () => {
  return [
    passport.authenticate('google', { session: false }),

    (req, res) => {
      return res.status(200).json({
        success: true
      })
    }
  ]
}

module.exports = {
  signInWithGoogle,
  googleAuthCallback
}
