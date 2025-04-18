const { Schema, model } = require('mongoose')

const PaymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reference: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'NGN'
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'abandoned'],
      required: true
    },
    channel: String, // e.g., card, bank, ussd
    gateway_response: String,
    planType: {
      type: String,
      enum: ['monthly', 'yearly']
    },
    paidAt: Date
  },
  { timestamps: true }
)

const Payment = model('Payment', PaymentSchema)
module.exports = Payment
