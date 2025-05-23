// memory.model.js
const { Schema, model } = require('mongoose')

const MemorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String
    },
    location: {
      type: String
    },
    date: {
      type: Date
    },
    tags: {
      type: [String],
      default: []
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    imageCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

const Memory = model('Memory', MemorySchema)
module.exports = Memory
