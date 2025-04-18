const repository = require('#database/repository');

module.exports = {
  getUserMemories: require('./services/memory.service').getUserMemories,
  createMemory: () => repository('memory').POST(),
  deleteMemory: () => repository('memory').DELETE()
}