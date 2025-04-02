// token.model.js
const { Schema, model } = require('mongoose')

const TokenSchema = new Schema(
  {
    // Define schema for Token
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    value: {
      type: String,
      required: true
    },
    expireAt: {
      type: Date,
      expires: 0
    }
  },
  { timestamps: true }
)

const Token = model('Token', TokenSchema)
module.exports = Token
