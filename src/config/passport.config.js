const passport = require('passport')
const { ExtractJwt, Strategy } = require('passport-jwt')
const User = require('#models/user.model')
const env = require('#utils/env')

const JWT_SECRET = env.get('JWT_SECRET', 'jwt-secret')
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}

passport.use(
  new Strategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.userId).lean()
      if (!user) {
        return done(null, false, { message: 'User not found' })
      }
      //Add more fields as needed
      const authenticatedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      return done(null, authenticatedUser)
    } catch (err) {
      return done(err, false, { message: 'Authentication error' })
    }
  })
)

module.exports = passport
