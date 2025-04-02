const { transporter } = require('#config/nodemailer.config')
const env = require('./env')

const sendMail = async ({ to, subject, text, html, ...rest }) => {
  try {
    const info = await transporter.sendMail({
      from: { name: env.get('APP_Name'), address: env.get('EMAIL_USER') },
      to,
      subject,
      text,
      html,
      ...(Object.keys(rest).length && rest)
    })

    return [null, info]
  } catch (error) {
    return [error, null]
  }
}

module.exports = {
  sendMail
}
