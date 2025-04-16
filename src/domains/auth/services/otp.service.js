const Token = require('#models/token.model')
const { randomString, setExpiryDate, isDateExpired } = require('#utils/helpers')

/**
 * Sends a One-Time Password (OTP) to the specified email address.
 *
 * @param {string} email - The email address to send the OTP to.
 * @param {string} userId - The ID of the user associated with the OTP.
 * @param {Object} [options={}] - Additional options for the email.
 * @param {string} [options.emailSubject='Account Recovery OTP'] - The subject of the email.
 * @param {string} [options.emailText] - The plain text content of the email.
 * @param {string} [options.emailHTML] - The HTML content of the email.
 * @returns {Promise<string>} - The generated OTP value.
 * @throws {Error} - Throws an error if email or userId is not provided.
 */

const getOTP = async (email, userId) => {
  if (!email) {
    throw new Error('Email is required.')
  }
  if (!userId) {
    throw new Error('User ID is required.')
  }

  let token = await Token.findOne({ user: userId })
  if (!token || isDateExpired(token.expireAt)) {
    await token?.deleteOne()

    token = await Token.create({
      user: userId,
      value: randomString(6, 'numeric'),
      expireAt: setExpiryDate('1 hour')
    })
  }
  return token.value
}

/**
 * Validates the provided OTP against the stored token.
 * @param {string} userId - The ID of the user associated with the OTP.
 * @param {string} otp - The OTP to validate.
 * @returns {Promise<boolean>} - Returns true if the OTP is valid and not expired, false otherwise.
 */
const validateOTP = async (userId, otp) => {
  const token = await Token.findOne({ user: userId, value: otp })
  if (!token || isDateExpired(token.expireAt)) {
    await token?.deleteOne()
    //throw new Error('Invalid or expired OTP.');
    return false
  }
  await token.deleteOne()
  return true
}

module.exports = {
  getOTP,
  validateOTP
}
