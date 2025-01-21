const env = require('../../../utils/env')
const User = require('../../../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).lean()
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
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
      id: user._id,
      email: user.email,
      name: user.name,
      token
    }
  })
}
