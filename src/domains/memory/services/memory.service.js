const MemoryImage = require('#models/memory-image.model')
const Memory = require('#models/memory.model')
const { parseSortQuery } = require('#utils/parsers')
const cloudinary = require('cloudinary')

module.exports = {
  /**
   * @api {get} /memories
   * @desc Gets the memories of the user with 5 memory images each
   * @domain Memories
   * @auth
   * @header {Authorization} Bearer <token>
   * @res {json}
   * {
   *   "success": true,
   *   "memories": [
   *      {
   *       "_id": "64e5a320c41e2f5e8e1c29a8",
   *       "title": "Hike to Mount Fuji",
   *       "description": "description of memory",
   *       "location": "Tokyo, Japan",
   *       "date": "2023-01-01T11:24:52.000Z",
   *       "tags": ["hiking", "nature"],
   *       "isPublic": true,
   *       "createdAt": "2023-01-01T00:00:00.000Z",
   *       "updatedAt": "2023-01-01T00:00:00.000Z",
   *       "images": [
   *         {
   *           "_id": "60e8cba1f1d73c004d6e9f01",
   *           "user": "64e5a2bac41e2f5e8e1c29a2",
   *           "memory": "64e5a2cbc41e2f5e8e1c29a3",
   *           "imageUrl": "https://example.com/image.jpg",
   *           "name": "IMG-MEM-1704067200000",
   *           "format": "jpg",
   *           "bytes": 123456,
   *           "publicId": "IMG-MEM-1704067200000",
   *           "createdAt": "2023-01-01T00:00:00.000Z",
   *           "updatedAt": "2023-01-01T00:00:00.000Z"
   *         }
   *       ]
   *     }
   *   ]
   * }
   * @par {search?} @query Searches for memories by title, location, or tag e.g search=<value>
   * @par {title?} @query Specific search by title e.g title=<value>
   * @par {location?} @query Specific search by location e.g location=<value>
   * @par {tag?} @query Specific search by tag e.g tag=<value>
   * @use {searchParams}
   */
  getUserMemories: async (req, res, next) => {
    const { id } = req.user
    try {
      const { limit = 0, skip = 0, sort, search, title, location, tag } = req.query

      const parsedLimit = parseInt(limit, 10) || 10
      const parsedSkip = parseInt(skip, 10) || 0
      const parsedSort = { createdAt: -1, ...(sort && parseSortQuery(sort)) }

      // Build filters
      const filters = { user: id }

      if (search) {
        const regex = new RegExp(search, 'i')
        filters.$or = [{ title: regex }, { location: regex }, { tags: regex }]
      }

      if (title) filters.title = new RegExp(title, 'i')
      if (location) filters.location = new RegExp(location, 'i')
      if (tag) filters.tags = new RegExp(tag, 'i')

      const memories = await Memory.aggregate([
        { $match: filters },
        { $sort: parsedSort },
        { $skip: parsedSkip },
        { $limit: parsedLimit },
        {
          $lookup: {
            from: 'memoryimages',
            let: { memoryId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$memory', '$$memoryId'] } } },
              { $limit: 5 }
            ],
            as: 'images'
          }
        }
      ])

      res.status(200).json({
        success: true,
        memories
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * @api {delete} /memories/:id
   * @desc Deletes a memory and all associated images
   * @domain Memories
   * @header {Authorization} Bearer <token>
   * @par {id} @path The memory ID
   * @res {json}
   * {
   *  "success": true,
   *  "message": "Memory and associated images deleted successfully"
   * }
   */
  async deleteMemory(req, res, next) {
    const { id: userId } = req.user
    const { id: memoryId } = req.params

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

      try {
        await cloudinary.v2.api.delete_folder(`MEMORY_IMAGES/${memoryId}`, {
          invalidate: true
        })
      } catch (cloudinaryError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete memory images. Try again later.',
          error: cloudinaryError
        })
      }

      await MemoryImage.deleteMany({ memory: memoryId })
      await memory.deleteOne()

      res.status(200).json({
        success: true,
        message: 'Memory and associated images deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}
