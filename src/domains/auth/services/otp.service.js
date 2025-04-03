const Token = require('#models/token.model')
const User = require('#models/user.model')
const { sendMail } = require('#utils/email')
const { randomString, setExpiryDate, isDateExpired } = require('#utils/helpers')

module.exports = {
  async sendOTP(req, res, next) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required.'
        })
      }

      const user = await User.findOne({ email }).lean()
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No user with the supplied email was found.'
        })
      }

      let token = await Token.findOne({ user: user._id })
      if (!token || isDateExpired(token.expireAt)) {
        await token?.deleteOne()

        token = await Token.create({
          user: user._id,
          value: randomString(6, 'numeric'),
          expireAt: setExpiryDate('1 hour')
        })
      }

      const [err] = await sendMail({
        to: email,
        subject: 'One Time Password (OTP)',
        text: `Your OTP is ${token.value}.\n`
      })
      if (err) {
        return res.status(500).json({
          success: false,
          message: `Failed to send OTP email: ${err.message}`
        })
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent to email successfully.',
      })
    } catch (error) {
      next(error)
    }
  }
}
