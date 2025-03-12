const { z } = require('zod')

const Schema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Invalid email' }),
  password: z
    .string({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine((p) => /[a-z]/.test(p), {
      message: 'Password must contain at least one lowercase letter'
    })
    .refine((p) => /[A-Z]/.test(p), {
      message: 'Password must contain at least one uppercase letter'
    })
    .refine((p) => /\d/.test(p), {
      message: 'Password must contain at least one number'
    })
})

module.exports = async (req, res, next) => {
  const data = req.body
  try {
    const result = await Schema.safeParseAsync(data)
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0].message
      })
    }
    next()
  } catch (error) {
    next(error)
  }
}
