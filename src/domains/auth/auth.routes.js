const { Router } = require('express')
const AuthController = require('./auth.controller')

const loginValidator = require('./validators/login.validator')
const registerValidator = require('./validators/register.validator')
const router = Router()

router.post('/login', loginValidator, AuthController.login)
router.post('/register', registerValidator, AuthController.register)

module.exports = router
