const { model, Schema } = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new Schema(
  {
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
      required: true,
      select: false
    },
    role: {
      type: String,
      default: 'USER'
    },
    verified: {
      type: Boolean,
      default: false
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    }
  },
  { timestamps: true }
)

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8)
  }
  next()
})

const User = model('User', UserSchema)

module.exports = User
