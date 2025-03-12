// profile.routes.js
const { Router } = require('express')
const ProfileController = require('./profile.controller')

const router = Router()

router.get('/:id?', ProfileController.getProfiles())
router.post('/', ProfileController.createProfile())
router.put('/:id', ProfileController.updateProfile())

module.exports = router