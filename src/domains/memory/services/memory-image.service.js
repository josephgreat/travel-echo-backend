const { parseSortQuery } = require('#utils/parsers')
const formidable = require('formidable')
const cloudinary = require('cloudinary')
const Memory = require('#models/memory.model')
const MemoryImage = require('#models/memory-image.model')

module.exports = {
  /**
   * @api {get} /memories/:memory_id/images
   * @desc Gets all images for a memory
   * @domain Memories
   * @auth
   * @header {Authorization} Bearer <token>
   * @par {memory_id} @path The memory ID
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
    const { id } = req.user
    const { memory_id } = req.params
    const {
      sort,
      limit,
      skip
    } = req.query

    const parsedLimit = parseInt(limit, 10) || 10
    const parsedSkip = parseInt(skip, 10) || 0
    const parsedSort = { createdAt: -1, ...parseSortQuery(sort) }

    try {
      const images = await MemoryImage
        .find({ user: id, memory: memory_id })
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
   * @api {post} /memories/:memory_id/images
   * @desc Add maximum of 50 images at a time to a memory
   * @domain Memories
   * @header {Authorization} Bearer <token>
   * @par {memory_id} @path The memory ID
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
    const { id } = req.user
    const { memory_id } = req.params

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
      const memory = await Memory.findById(memory_id) 

      if (!memory) {
        return res.status(404).json({
          success: false,
          message: 'Memory not found'
        })
      }

      if (memory.user.toString() !== id) {
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
              folder: `MEMORY_IMAGES/${memory_id}`,
              resource_type: 'auto',
              public_id: `MEM-IMG-${memory_id}-${new Date().getTime()}`
            },
            (error, result) => {
              if (error) {
                Object.assign(file, { _error: error })
              } else {
                uploadedFiles.push({
                  user: id,
                  memory: memory_id,
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
  }
}