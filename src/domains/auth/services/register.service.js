const User = require('#models/user.model')
const Profile = require('#models/profile.model')
const { createObjectFromFields } = require('#utils/helpers')

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
    const userProfile = new Profile({ user: newUser._id })

    newUser.profile = userProfile._id
    await newUser.save()
    await userProfile.save()

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: createObjectFromFields(newUser.toObject(), [
        '_id',
        'name',
        'email',
        'role',
        'profile'
      ])
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while registering user',
      error: error.message
    })
  }
}
