const { parseSortQuery } = require('#utils/parsers')
const formidable = require('formidable')
const cloudinary = require('cloudinary')
const Memory = require('#models/memory.model')
const MemoryImage = require('#models/memory-image.model')

module.exports = {
  /**
   * @api {get} /memories/:id/images
   * @desc Gets all images for a memory
   * @domain Memories
   * @auth
   * @header {Authorization} Bearer <token>
   * @par {id} @path The memory ID
   * @use {searchParams}
   * @res {json}
   * {
   *  "success": true,
   *  "images": [
   *    {
   *      "user": "65defc452caed3211ad24de4e",
   *      "memory": "62dae0d52caed6001ad24da0",
   *      "imageUrl": "https://example.com/image.jpg",
   *      "name": "IMG-MEM-34442323N324N57585744",
   *      "format": "jpg",
   *      "bytes": 123456,
   *      "publicId": "IMG-MEM-34442323N324N57585744",
   *      "createdAt": "2023-01-01T00:00:00.000Z",
   *      "updatedAt": "2023-01-01T00:00:00.000Z"
   *    }
   *  ]
   * }
   */
  async getUserMemoryImages(req, res, next) {
    const { id: userId } = req.user
    const { id: memoryId } = req.params
    const { sort, limit, skip } = req.query

    const parsedLimit = parseInt(limit, 10) || 10
    const parsedSkip = parseInt(skip, 10) || 0
    const parsedSort = { createdAt: -1, ...parseSortQuery(sort) }

    try {
      const images = await MemoryImage.find({ user: userId, memory: memoryId })
        .sort(parsedSort)
        .skip(parsedSkip)
        .limit(parsedLimit)
        .lean()

      res.status(200).json({
        success: true,
        images
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * @api {post} /memories/:id/images
   * @desc Add maximum of 50 images at a time to a memory
   * @domain Memories
   * @header {Authorization} Bearer <token>
   * @par {id} @path The memory ID
   * @body {FormData} Form Data
   * @res {json}
   * {
   *  "success": true,
   *  "totalFilesReceived": 50,
   *  "filesUploaded": 50,
   *  "filesFailed": 0
   * }
   */
  async addImagesToMemory(req, res, next) {
    const MAX_FILES = 50
    const MAX_FILE_SIZE = 200 * 1024 * 1024
    const { id: userId } = req.user
    const { id: memoryId } = req.params

    /**
     * @type {Array<{
     *  user: string,
     *  memory: string,
     *  imageUrl: string,
     *  name: string,
     *  format: string,
     *  bytes: number
     * }>} uploadedFiles
     */
    const uploadedFiles = []

    try {
      const memory = await Memory.findById(memoryId)

      if (!memory) {
        return res.status(404).json({
          success: false,
          message: 'Memory not found'
        })
      }

      if (memory.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        })
      }

      const form = formidable({
        keepExtensions: true,
        maxFiles: MAX_FILES,
        maxFileSize: MAX_FILE_SIZE,
        fileWriteStreamHandler: (file) => {
          const transformStream = cloudinary.v2.uploader.upload_stream(
            {
              folder: `MEMORY_IMAGES/${memoryId}`,
              resource_type: 'auto',
              public_id: `MEM-IMG-${memoryId}-${new Date().getTime()}`
            },
            (error, result) => {
              if (error) {
                Object.assign(file, { _error: error })
              } else {
                uploadedFiles.push({
                  user: userId,
                  memory: memoryId,
                  imageUrl: result.secure_url,
                  name: result.public_id,
                  publicId: result.public_id,
                  format: result.format,
                  bytes: result.bytes
                })
              }
            }
          )
          return transformStream
        }
      })

      await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            return reject(err)
          }
          resolve({ fields, files })
        })
      })

      if (!uploadedFiles.length) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        })
      }

      const { uploaded, failed } = uploadedFiles.reduce(
        (acc, file) => {
          if (file._error) {
            acc.failed.push(file)
          } else {
            acc.uploaded.push(file)
          }
          return acc
        },
        { uploaded: [], failed: [] }
      )

      if (uploaded.length) {
        await MemoryImage.insertMany(uploaded, { limit: MAX_FILES })
      }

      return res.status(200).json({
        success: true,
        totalFilesReceived: uploadedFiles.length,
        filesUploaded: uploaded.length,
        filesFailed: failed.length
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * @api {put} /memories/images/:id
   * @par {id} @path The image id
   * @desc Updates a memory image. Only the image name can be updated
   * @domain Memories
   * @header {Authorization} Bearer <token>
   * @body {json} { "name": "string | required" }
   * @res {json}
   * {
   *  "success": true,
   *  "message": "Image name updated successfully"
   * }
   */
  async updateMemoryImage(req, res, next) {
    const { id: imageId } = req.params
    const { name } = req.body
    const userId = req.user.id

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Image name is required'
      })
    }

    try {
      const image = await MemoryImage.findOne({
        _id: imageId,
        user: userId
      })

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Image not found or unauthorized'
        })
      }

      if (name === image.name) {
        return res.status(200).json({
          success: true,
          message: 'Image name unchanged',
          data: image
        })
      }

      // Generate unique name if needed
      let newName = name
      let counter = 0
      const MAX_ATTEMPTS = 100

      while (counter <= MAX_ATTEMPTS) {
        const exists = await MemoryImage.exists({
          memory: image.memory,
          user: userId,
          name: newName,
          _id: { $ne: image._id }
        })

        if (!exists) break

        counter++
        newName = `${name}(${counter})`
      }

      if (counter > MAX_ATTEMPTS) {
        return res.status(409).json({
          success: false,
          message:
            'Could not find a unique name variant after multiple attempts'
        })
      }

      image.name = newName
      await image.save()

      return res.status(200).json({
        success: true,
        message: 'Image name updated successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * @api {patch} /memories/:id/images
   * @par {id} @path The memory id
   * @desc Deletes images from a memory
   * @domain Memories
   * @use {commonHeaders}
   * @body {json} ["imageid1", "imageid2"] Note: sending an empty array will delete all images in the memory
   * @res {json}
   * {
   *  "success": true,
   *  "message": "Images deleted successfully"
   * }
   */
  async deleteMemoryImages(req, res, next) {
    const { id: userId } = req.user
    const { id: memoryId } = req.params
    const data = req.body

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Expected array of image IDs'
      })
    }

    try {
      const memory = await Memory.findById(memoryId)
      if (!memory) {
        return res.status(404).json({
          success: false,
          message: 'Memory not found'
        })
      }
      if (data.length === 0) {
        //Delete all images
        try {
          await cloudinary.v2.api.delete_folder(`MEMORY_IMAGES/${memoryId}`, { invalidate: true })
        } catch (cloudinaryError) {
          return res.status(500).json({
            success: false,
            message: 'Failed to delete images',
            error: cloudinaryError
          })
        }

        await MemoryImage.deleteMany({ user: userId, memory: memoryId })
        return res.status(200).json({
          success: true,
          message: 'All images deleted successfully'
        })
      }

      if (data.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Maximum of 100 images can be deleted at once'
        })
      } 

      const images = await MemoryImage.find({ user: userId, memory: memoryId, _id: { $in: data } })
      const imagePublicIds = images.map(image => image.publicId)

      await cloudinary.v2.api.delete_resources(imagePublicIds, { invalidate: true })
      await MemoryImage.deleteMany({ user: userId, memory: memoryId, _id: { $in: data } })

      res.status(200).json({
        success: true,
        message: 'Images deleted successfully'
      })

    } catch (error) {
      next(error)
    }
  }
}
