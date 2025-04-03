const { Router } = require('express')
const AuthController = require('./auth.controller')

const loginValidator = require('./validators/login.validator')
const registerValidator = require('./validators/register.validator')
const router = Router()

router.post('/login', loginValidator, AuthController.login)
router.post('/register', registerValidator, AuthController.register)

//Email verification
router.post('/otp/send', AuthController.sendOTP)

module.exports = router
