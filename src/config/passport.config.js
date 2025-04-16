const passport = require('passport')
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const User = require('#models/user.model')
const env = require('#utils/env')
const { signJWT } = require('#utils/helpers')

const JWT_SECRET = env.get('JWT_SECRET', 'jwt-secret')
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}

passport.use(
  new JWTStrategy(jwtOptions, async (payload, done) => {
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
    } catch (error) {
      return done(error, false, { message: 'Authentication error' })
    }
  })
)

//Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.get('GOOGLE_CLIENT_ID'),
      clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id })

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            verified: profile.emails[0].verified,
            name: profile.displayName
          })
        }

        const token = signJWT(user)

        return done(null, { token })
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

module.exports = passport
