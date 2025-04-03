const { transporter } = require('#config/nodemailer.config')
const env = require('./env')

/**
 * Sends an email using the configured Nodemailer transporter.
 *
 * @async
 * @function sendMail
 * @param {Object} options - The email options.
 * @param {string|string[]} options.to - Recipient email address(es).
 * @param {string} options.subject - Email subject line.
 * @param {string} [options.text] - Plain text version of the message.
 * @param {string} [options.html] - HTML version of the message.
 * @param {Object.<string, any>} [options.rest] - Additional email options to pass to Nodemailer.
 *                                                 See: https://nodemailer.com/message/
 * @returns {Promise<[Error|null, Object|null]>} A promise resolving to `[error, info]`,
 *                                               where `error` is null on success and `info` is null on failure.
 *                                               For the info object, see: https://nodemailer.com/usage/
 * @throws {Error} If an unexpected issue occurs with the transporter.
 * @example
 * const [error, info] = await sendMail({
 *   to: 'recipient@example.com',
 *   subject: 'Hello',
 *   text: 'Hello world',
 *   html: '<p>Hello world</p>'
 * });
 *
 * if (error) {
 *   console.error('Failed to send email:', error);
 * } else {
 *   console.log('Email sent successfully:', info);
 * }
 */
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
