const repository = require('#database/repository')
const { createObjectFromFields } = require('#utils/helpers')

module.exports = {
  getUserMemories: require('./services/memory.service').getUserMemories,

  /**
   * @api {post} /memories
   * @desc Creates a new memory
   * @domain Memories
   * @auth
   * @header {Authorization} Bearer <token>
   * @body {json}
   * {
   *  "user": "user id e.g 6daer7657asad7575 | required",
   *  "title": "string | required",
   *  "description": "string | optional",
   *  "location": "string | optional",
   *  "date": "date | optional",
   *  "tags": "array of strings | optional",
   *  "isPublic": "boolean | optional | default true"
   * }
   * @res {json}
   * {
   *  "success": true,
   *  "memory": {
   *    "_id": "65defc452caed3211ad24de4e",
   *    "title": "Hike to Mount Fuji",
   *    "description": "description of memory",
   *    "location": "Tokyo, Japan",
   *    "date": "2023-01-01",
   *    "tags": ["hiking", "nature"],
   *    "isPublic": true,
   *    "createdAt": "2023-01-01T00:00:00.000Z",
   *    "updatedAt": "2023-01-01T00:00:00.000Z"
   *  }
   * }
   */
  createMemory: () =>
    repository('memory').POST({
      onBeforeCreate: async (data, { req, res, Model }) => {
        const memoryWithExistingTitle = await Model.findOne({
          user: req.user.id,
          title: data.title
        })
        if (memoryWithExistingTitle) {
          res.status(400).json({
            success: false,
            message: 'A memory with this title already exists.'
          })
          return { interrupt: true }
        }
        return { data }
      }
    }),

  /**
   * @api {put} /memories/:id
   * @par {id} @path The memory id
   * @desc Updates a memory
   * @domain Memories
   * @header {Authorization} Bearer <token>
   * @body {json}
   * {
   *  "title": "string | optional",
   *  "description": "string | optional",
   *  "location": "string | optional",
   *  "date": "date | optional",
   *  "tags": "array of strings | optional",
   *  "isPublic": "boolean | optional | default true"
   * }
   * @res {json}
   * {
   *  "success": true,
   *  "memory": {
   *    "_id": "65defc452caed3211ad24de4e",
   *    "title": "Hike to Mount Fuji",
   *    "description": "description of memory",
   *    "location": "Tokyo, Japan",
   *    "date": "2023-01-01",
   *    "tags": ["hiking", "nature"],
   *    "isPublic": true,
   *    "createdAt": "2023-01-01T00:00:00.000Z",
   *    "updatedAt": "2023-01-01T00:00:00.000Z"
   *  }
   * }
   */
  editMemory: () =>
    repository('memory').UPDATE({
      onBeforeUpdate: async (data, { req, res, Model }) => {
        const updated = createObjectFromFields(data, [
          'title',
          'description',
          'location',
          'date',
          'tags',
          'isPublic'
        ])
        const { id } = req.params

        const memoryWithExistingTitle = await Model.findOne({
          user: req.user.id,
          title: updated.title,
          _id: { $ne: id }
        })
        if (memoryWithExistingTitle) {
          res.status(400).json({
            success: false,
            message: 'Memory with this title already exists.'
          })
          return { interrupt: true }
        }
        return { data: updated }
      }
    }),

  deleteMemory: require('./services/memory.service').deleteMemory,

  getUserMemoryImages: require('./services/memory-image.service')
    .getUserMemoryImages,

  addImagesToMemory: require('./services/memory-image.service')
    .addImagesToMemory,

  updateMemoryImage: require('./services/memory-image.service')
    .updateMemoryImage,

  deleteMemoryImages: require('./services/memory-image.service')
    .deleteMemoryImages
}
