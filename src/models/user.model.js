const { model, Schema } = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new Schema(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    },
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
    passwordHistory: {
      type: [String],
      select: false,
      default: []
    },
    googleId: String,
    verified: {
      type: Boolean,
      default: false
    },

    // PAYSTACK CUSTOMER CODE
    paystackCustomerCode: {
      type: String
    },

    // PLAN INFO
    plan: {
      type: String,
      enum: ['FREE', 'PREMIUM'],
      default: 'FREE'
    },

    // SUBSCRIPTION INFO
    subscription: {
      type: {
        isActive: {
          type: Boolean
        },
        planType: {
          type: String,
          enum: ['MONTHLY', 'YEARLY'],
          default: 'MONTHLY'
        },
        paystackSubscriptionCode: String,
        startedAt: Date,
        expiresAt: Date
      },
      default: {
        isActive: false
      }
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

module.exports = model('User', UserSchema)
