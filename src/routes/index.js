const { Router } = require('express')

//Import routes
const authRoutes = require('../domains/auth/auth.routes')

const router = Router()

//Register all routes here
const routes = () => {
  router.use('/auth', authRoutes)

  return router
}

module.exports = routes
