const nodemailer = require('nodemailer')
const env = require('#utils/env')

const transporter = nodemailer.createTransport({
  host: env.get('EMAIL_HOST'),
  port: 465,
  secure: true,
  auth: {
    user: env.get('EMAIL_USER'),
    pass: env.get('EMAIL_PASSWORD')
  }
})

module.exports = transporter
