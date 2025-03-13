const env = require('#utils/env')
const User = require('#models/user.model')
const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean()
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      })
    }

    // Create a new user
    const newUser = new User({ name, email, password })
    await newUser.save()

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      env.get('JWT_SECRET'),
      { expiresIn: '1d' }
    )

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        token
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while registering user',
      error: error.message
    })
  }
}
