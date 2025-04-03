const { Schema, model } = require('mongoose')
const { MINIMUM_AGE } = require('#utils/constants')
const { computeAge } = require('#utils/helpers')

const ProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      immutable: true
    },
    dateOfBirth: {
      type: Date
    },
    image: {
      type: String
    },
    location: {
      type: String
    },
    school: {
      name: {
        type: String
      },
      country: {
        type: String
      }
    },
    occupation: {
      type: String
    },
    interests: {
      type: [String]
    },
    languages: {
      type: [String]
    }
  },
  { timestamps: true }
)

ProfileSchema.pre('save', async function (next) {
  if (this.isModified('dateOfBirth')) {
    const age = computeAge(this.dateOfBirth)
    // Check if age is at least 15
    if (age < MINIMUM_AGE) {
      return next(new Error('You must be at least 15 years old.'))
    }
  }
  next()
})

const Profile = model('Profile', ProfileSchema)

module.exports = Profile
