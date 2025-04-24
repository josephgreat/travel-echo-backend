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
   * { "success": true, "memory": {...} }
   * 
   */
  createMemory: () => repository('memory').POST(),
  deleteMemory: () => repository('memory').DELETE()
}