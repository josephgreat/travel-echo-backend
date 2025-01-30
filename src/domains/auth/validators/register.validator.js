const { z } = require('zod');

const Schema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name must not exceed 50 characters' }),
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Invalid email' }),
  password: z
    .string({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine((password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password), {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  confirmPassword: z
    .string({ message: 'Confirm Password is required' })
    .refine((confirmPassword, ctx) => confirmPassword === ctx.parent.password, {
      message: 'Passwords must match',
    }),
});

module.exports = async (req, res, next) => {
  const data = req.body;

  const result = await Schema.safeParseAsync(data);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.errors[0].message,
    });
  }

  next();
};
