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
    .refine((p) => /[a-z]/.test(p), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((p) => /[A-Z]/.test(p), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((p) => /\d/.test(p), {
      message: 'Password must contain at least one number',
    }),
  confirmPassword: z
    .string({ message: 'Confirm Password is required' })
});


const validationSchema = Schema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords must match",
    path: ["confirmPassword"],
  }
);

module.exports = async (req, res, next) => {
  const data = req.body;
  try {
    const result = await validationSchema.safeParseAsync(data);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0].message,
      });
    }
    next();
  } catch(error) {
    next(error)
  }
};