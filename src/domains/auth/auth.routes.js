const { Router } = require('express')
const AuthController = require('./auth.controller')

const loginValidator = require('./validators/login.validator')
const registerValidator = require('./validators/register.validator')
const resetPasswordValidator = require('./validators/password-reset.validator')

const router = Router()

router.post('/login', loginValidator, AuthController.login)
router.post('/register', registerValidator, AuthController.register)
router.get('/google', AuthController.signInWithGoogle)
router.get('/google/callback', AuthController.googleAuthCallback)

//Email verification
router.post('/verification/send-otp', AuthController.sendAccountVerificationEmail)
router.post('/verification/verify', AuthController.verifyAccount)

//Account recovery
router.post('/recovery/send-otp', AuthController.sendAccountRecoveryEmail)
router.post('/recovery/verify-otp', AuthController.verifyAccountRecoveryOTP)
router.post('/recovery/reset-password', resetPasswordValidator, AuthController.resetPassword)

module.exports = router
