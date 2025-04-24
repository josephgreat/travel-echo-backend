const repository = require('#database/repository');

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
  createMemory: () => repository('memory').POST(),

  getUserMemoryImages: require('./services/memory-image.service').getUserMemoryImages,

  addImagesToMemory: require('./services/memory-image.service').addImagesToMemory
}