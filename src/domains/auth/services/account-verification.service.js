const User = require('#models/user.model')
const { sendMail } = require('#utils/email')
const { getOTP, validateOTP } = require('./otp.service')

module.exports = {
  async sendAccountVerificationEmail(req, res, next) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        })
      }

      const user = await User.findOne({ email }).lean()
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Account not found.'
        })
      }

      const token = await getOTP(email, user._id)

      await sendMail({
        to: email,
        subject: 'Account Verification',
        text: `Your OTP is ${token}.\n`
      })

      return res.status(200).json({
        success: true,
        message: 'OTP sent to email successfully.'
      })
    } catch (error) {
      next(error)
    }
  },

  async verifyAccount(req, res, next) {
    try {
      const { email, otp } = req.body

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required.'
        })
      }

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Invalid email or OTP.'
        })
      }

      if (!(await validateOTP(user._id, otp))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP.'
        })
      }

      user.verified = true
      await user.save()

      return res.status(200).json({
        success: true,
        message: 'Account verified successfully.'
      })
    } catch (error) {
      next(error)
    }
  }
}
