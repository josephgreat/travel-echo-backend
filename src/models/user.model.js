const { model, Schema } = require('mongoose')

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  }
})

const User = model('User', UserSchema)

module.exports = User
