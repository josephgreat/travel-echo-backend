const { Schema, model } = require('mongoose')

const PlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    currency: {
      type: String,
      default: 'NGN'
    },
    features: {
      type: [String],
      required: true
    },
    billingOptions: [
      {
        billingCycle: {
          type: String,
          enum: ['monthly', 'yearly'],
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        paystackPlanCode: {
          type: String,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
)

const Plan = model('Plan', PlanSchema)
module.exports = Plan
