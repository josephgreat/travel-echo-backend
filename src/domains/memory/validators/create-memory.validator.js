const { z } = require('zod')

const Schema = z.object({
  user: z
    .string({ message: 'User ID is required' })
    .uuid({ message: 'User ID must be a valid UUID string'}),
  title: z
    .string({ message: 'Memory title is required' }),
  description: z
    .string({ message: 'Invalid description provided' })
    .optional(),
  location: z
    .string({ message: 'Invalid location provided' })
    .optional(),
  date: z
    .string({ message: 'Invalid date provided' })
    .refine((date) => new Date(date).toString() !== 'Invalid Date', { message: 'Invalid date provided' })
    .optional(),
  tags: z
    .array(z.string(), { message: 'Tags must be an array of strings' })
    .optional(),
  isPublic: z
    .boolean({ message: 'Public status of memory must be true or false'})
    .optional()
});

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