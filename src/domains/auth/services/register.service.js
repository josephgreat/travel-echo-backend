const User = require('#models/user.model')
const Profile = require('#models/profile.model')
const { createObjectFromFields } = require('#utils/helpers')

/**
 *
 * @api {post} /auth/register
 * @domain Authentication
 * @desc Register
 * @header {Content-Type} application/json
 * @body {json} { "name": "string", "email": "string", "password": "string", "confirmPassword": "string" }
 * @res {json}  { "success": "boolean", "message": "string", "user": {...} }
 */
module.exports = async (req, res, next) => {
  const { name, email, password } = req.body

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean()
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use. Try logging in instead.'
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
      message: 'User registered successfully.',
      user: createObjectFromFields(newUser.toObject(), ['_id', 'name', 'email'])
    })
  } catch (error) {
    next(error)
  }
}
