const { Router } = require('express')

//Import routes
const authRoutes = require('#domains/auth/auth.routes')
const profileRoutes = require('#domains/profile/profile.routes')

const authenticate = require('#middleware/authenticate')

const router = Router()

//Register all routes here
const routes = () => {
  router.use('/api/auth', authRoutes)
  router.use('/api/profiles', authenticate('USER'), profileRoutes)

  return router
}

module.exports = routes
