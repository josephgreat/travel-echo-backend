const env = require('#utils/env')
const User = require('#models/user.model')
const jwt = require('jsonwebtoken')
const { createObjectFromFields } = require('#utils/helpers')

module.exports = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      env.get('JWT_SECRET'),
      { expiresIn: '1d' }
    )

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        ...createObjectFromFields(user.toObject(), [
          '_id',
          'name',
          'email',
          'role',
          'profile'
        ]),
        token
      }
    })
  } catch (error) {
    next(error)
  }
}
