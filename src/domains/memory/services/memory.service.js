const Memory = require('#models/memory.model')
const { parseSortQuery } = require('#utils/parsers')
const { isObjectIdOrHexString } = require('mongoose')
const { ObjectId } = require('mongoose').Types

module.exports = {
  // GET user's memories with support for search and field filters
  getUserMemories: async (req, res, next) => {
    try {
      const { id } = req.params

      if (!isObjectIdOrHexString(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        })
      }

      const {
        limit,
        skip,
        sort,
        search,
        title,
        location,
        tag
      } = req.query

      const parsedLimit = parseInt(limit, 10) || 10
      const parsedSkip = parseInt(skip, 10) || 0
      const parsedSort = { ...parseSortQuery(sort), createdAt: -1 }

      // Build filters
      const filters = { user: ObjectId.createFromHexString(id) }

      if (search) {
        const regex = new RegExp(search, 'i')
        filters.$or = [
          { title: regex },
          { location: regex },
          { tags: regex }
        ]
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
              { $limit: 10 }
            ],
            as: 'imageUrls'
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
  }
}
