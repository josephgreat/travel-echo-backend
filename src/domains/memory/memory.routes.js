// memory.routes.js
const { Router } = require('express')
const MemoryController = require('./memory.controller')

const router = Router()

router.get('/user/:id', MemoryController.getUserMemories)
//Create memory
router.post('/', MemoryController.createMemory())
//Delete memory
router.delete('/:id', MemoryController.deleteMemory())

//Memory Images
router.get('/user/:id/images')
router.post('/user/:id/images')
router.put('/user/:id/images')

module.exports = router