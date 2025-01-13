const { Router } = require('express')
const AuthController = require('./auth.controller')

const router = Router()

router.post('/login', AuthController.login)
router.post('/register')

module.exports = router