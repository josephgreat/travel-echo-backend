// memory.routes.js
const { Router } = require('express')
const MemoryController = require('./memory.controller')
const createMemoryValidator = require('./validators/create-memory.validator')
const { objectIdValidator } = require('#utils/helpers')

const router = Router()

//Gets the memories of a user
router.get('/', MemoryController.getUserMemories)
//Creates a memory
router.post('/', createMemoryValidator, MemoryController.createMemory())
//Edits a memory
router.put('/:id', MemoryController.editMemory())
//Deletes a memory
router.delete(
  '/:id',
  objectIdValidator('memory'),
  MemoryController.deleteMemory
)

//Memory Images
//Gets all images for a memory
router.get(
  '/:id/images',
  objectIdValidator('memory'),
  MemoryController.getUserMemoryImages
)
//Adds maximum of 50 images to a memory
router.post(
  '/:id/images',
  objectIdValidator('memory'),
  MemoryController.addImagesToMemory
)
//Updates a memory image
router.put(
  '/images/:id',
  objectIdValidator('image'),
  MemoryController.updateMemoryImage
)
//Deletes images from a memory
router.patch(
  '/:id/images',
  MemoryController.deleteMemoryImages
)

module.exports = router
