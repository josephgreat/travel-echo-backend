// memory.routes.js
const { Router } = require('express')
const MemoryController = require('./memory.controller')
const createMemoryValidator = require('./validators/create-memory.validator')
const memoryIdValidator = require('./validators/memory-id.validator')

const router = Router()

//Gets the memories of a user
router.get('/', MemoryController.getUserMemories)

//Creates a memory
router.post('/', createMemoryValidator, MemoryController.createMemory())

//Delete memory
//router.delete('/:id', MemoryController.deleteMemory())

//Memory Images
router.get('/:memory_id/images', memoryIdValidator, MemoryController.getUserMemoryImages)
router.post('/:memory_id/images', memoryIdValidator, MemoryController.addImagesToMemory)

module.exports = router