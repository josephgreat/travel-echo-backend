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
    unique: true
  }
}, {
  timestamps: true
})


const MemoryImage = model('MemoryImage', MemoryImageSchema)
module.exports = MemoryImage
