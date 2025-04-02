// profile.routes.js
const { Router } = require('express')
const ProfileController = require('./profile.controller')

const fileUpload = require('express-fileupload')

const router = Router()

router.get('/:id?', ProfileController.getProfile())
router.post('/', ProfileController.createProfile())
router.put('/:id', ProfileController.updateProfile())

//Profile Image
router.use('/image', fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }))
router.put('/image/:id', ProfileController.uploadProfileImage())
router.delete('/image/:id', ProfileController.removeProfileImage())

module.exports = router
