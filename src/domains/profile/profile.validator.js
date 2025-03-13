const { isValidObjectId } = require('mongoose')
const { z } = require('zod')

module.exports = {
  postQueryValidator: () => {
    const Schema = z.object({
      user: z
        .string({ message: 'User field is required' })
        .refine((userId) => isValidObjectId(userId), {
          message: 'User field must be a valid MongoDB object ID'
        })
    })

    return async (req, res, next) => {
      try {
        const result = await Schema.safeParseAsync(req.body)
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
  }
}
