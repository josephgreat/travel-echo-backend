const { Router } = require('express')
const AuthController = require('./auth.controller')

const loginValidator = require('./validators/login.validator')

const router = Router()

router.post('/login', loginValidator, AuthController.login)
router.post('/register')

module.exports = router
