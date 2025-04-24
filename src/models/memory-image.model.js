const { Schema, model } = require('mongoose')

const MemoryImageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memory: {
    type: Schema.Types.ObjectId,
    ref: 'Memory',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  publicId: {
    type: String
  },
  format: {
    type: String
  },
  bytes: {
    type: Number
  }
}, {
  timestamps: true
})


const MemoryImage = model('MemoryImage', MemoryImageSchema)
module.exports = MemoryImage
