const User = require('#models/user.model')
const { sendMail } = require('#utils/email')
const { getOTP, validateOTP } = require('./otp.service')
const { compare } = require('bcrypt')

module.exports = {
  /**
 * 
 * @api {post} /recovery/send-otp
 * @domain Authentication
 * @desc Send OTP to verify user's account exists
 * @header {Content-Type} application/json
 * @body {json} { "email": "user@email.com" }
 * @res {json}
 * { 
 *  "success": true, 
 *  "message": "OTP sent to email successfully.",  
 *  "user": {
 *    "_id": "string",
 *    "email": "string",
 *    "name": "string"
 *  }
 * }
 */
  async sendAccountRecoveryEmail(req, res, next) {
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
        subject: 'Account Recovery OTP',
        text: `Your OTP is ${token}.\n`
      })

      return res.status(200).json({
        success: true,
        message: 'OTP sent to email successfully',
        user: {
          _id: user._id,
          email: user.email,
          name: user.name
        }
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * 
   * @api {post} /recovery/verify-otp
   * @domain Authentication
   * @desc Verify the account recovery OTP
   * @header {Content-Type} application/json
   * @body {json} { "email": "user@email.com", "otp": "123456" }
   * @res {json}
   * { 
   *  "success": true, 
   *  "message": "OTP verified successfully.",  
   *  "user": {
   *    "_id": "string",
   *    "email": "string",
   *    "name": "string"
   *  }
   * }
   */
  async verifyAccountRecoveryOTP(req, res, next) {
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
          message: 'Account not found.'
        })
      }

      if (!(await validateOTP(user._id, otp))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP.'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
        user: {
          _id: user._id,
          email: user.email,
          name: user.name
        }
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * 
   * @api {post} /recovery/reset-password
   * @domain Authentication
   * @desc Reset user's password
   * @header {Content-Type} application/json
   * @body {json} { "email": "user@email.com", "password": "password123", "confirmPassword": "password123" }
   * @res {json}
   * { 
   *  "success": true, 
   *  "message": "Password reset successfully." 
   * }
   */
  async resetPassword(req, res, next) {
    try {
      const { email, password } = req.body
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        })
      }

      const user = await User.findOne({ email }).select(
        '+password +passwordHistory'
      )
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Account not found.'
        })
      }

      user.passwordHistory = user.passwordHistory || []

      if (user.passwordHistory.length) {
        let reused = false
        for (const previousPassword of user.passwordHistory) {
          const match = await compare(password, previousPassword)
          if (match) {
            reused = true
            break
          }
        }
        if (reused) {
          return res.status(400).json({
            success: false,
            message: 'You cannot use a password you have used before.'
          })
        }
      }

      user.passwordHistory.unshift(user.password)

      // Limit history length to 20
      user.passwordHistory = user.passwordHistory.slice(0, 20)

      user.password = password
      await user.save()

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully.'
      })
    } catch (error) {
      next(error)
    }
  }
}
