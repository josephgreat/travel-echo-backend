const cloudinary = require('cloudinary')
const logger = require('./logger')
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const env = require('#utils/env')
const { isObjectIdOrHexString } = require('mongoose')

const helpers = {
  computeAge(dateOfBirth) {
    const dob = new Date(dateOfBirth)
    if (!dob) {
      return 0
    }
    const now = new Date()

    let age = now.getFullYear() - dob.getFullYear()
    const monthDiff = now.getMonth() - dob.getMonth()
    const dayDiff = now.getDate() - dob.getDate()

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--
    }
    return age
  },

  isPlainObject(value) {
    return (
      typeof value === 'object' && value !== null && !Array.isArray(value) //Object.getPrototypeOf(value) === Object.prototype
    )
  },

  createObjectFromFields(obj, ...fields) {
    if (!(typeof obj === 'object' && obj !== null && !Array.isArray(obj)))
      return {}

    // If fields is passed as an array, extract it
    if (Array.isArray(fields[0])) fields = fields[0]

    return fields.reduce((acc, field) => {
      const keys = field.split('.')
      let value = obj

      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key]
        } else {
          value = undefined
          break
        }
      }

      if (value !== undefined) {
        if (keys.length === 1) {
          // If the field is not nested, assign directly
          acc[keys[0]] = value
        } else {
          // Handle nested properties
          keys.reduce((nestedObj, key, index) => {
            if (index === keys.length - 1) {
              nestedObj[key] = value
            } else {
              nestedObj[key] = nestedObj[key] || {}
            }
            return nestedObj[key]
          }, acc)
        }
      }
      return acc
    }, {})
  },

  toTitleCase(str) {
    if (typeof str !== 'string') {
      return str
    }
    return str.replace(
      /\b\w+/g,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
    )
  },

  async uploadCloudinaryAsset(asset, options) {
    try {
      const result = await cloudinary.v2.uploader.upload(asset, options)
      return result
    } catch (error) {
      logger.error(
        `Error uploading image to Cloudinary: ${error.message ?? error}`
      )
      throw error
    }
  },

  async removeCloudinaryAsset(asset, options) {
    try {
      const result = await cloudinary.v2.uploader.destroy(asset, options)
      return result
    } catch (error) {
      logger.error(
        `Error removing image from Cloudinary: ${error.message ?? error}`
      )
      throw error
    }
  },

  generateToken(length = 10, type) {
    const charSets = {
      numeric: '1234567890',
      num: '1234567890',
      alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      alphanumeric:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alphanum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    }

    const charSet =
      type && charSets[type] ? charSets[type] : charSets['numeric']
    const charSetLength = charSet.length
    let pin = ''

    while (pin.length < length) {
      const randomBytes = crypto.randomBytes(1)
      const randomValue = randomBytes[0]

      if (randomValue < charSetLength) {
        pin += charSet[randomValue]
      }
    }
    return pin
  },

  /**
   * Generates a random string based on length or pattern.
   *
   * - If `lengthOrPattern` is a number, it generates a random string of that length.
   * - If `lengthOrPattern` is a pattern (e.g., "9aA"), it replaces '9' with a digit, 'a' with a lowercase letter, and 'A' with an uppercase letter.
   *
   * @param {number | string} lengthOrPattern - The length of the random string or a pattern (e.g., "9aA").
   * @param {'numeric' | 'num' | 'alphabetic' | 'alpha' | 'uppercase' | 'alphanumeric' | 'alphanum'} [type='alphanumeric'] - The type of characters to use (only used when `lengthOrPattern` is a number).
   * @returns {string} A randomly generated string based on the given constraints.
   */
  randomString(lengthOrPattern, type) {
    const DEFAULT_STR_LENGTH = 16
    // Define character sets
    const charSets = {
      numeric: '0123456789',
      num: '0123456789',
      alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      alphanumeric:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alphanum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    }

    const getUnbiasedRandomChar = (charset) => {
      const charsetLength = charset.length
      const bytesNeeded = Math.ceil(Math.log(charsetLength) / Math.log(256))
      const maxValidValue =
        Math.floor(256 ** bytesNeeded / charsetLength) * charsetLength

      while (true) {
        const randomBytes = crypto.randomBytes(bytesNeeded)

        let randomValue = 0
        for (let i = 0; i < bytesNeeded; i++) {
          randomValue = randomValue * 256 + randomBytes[i]
        }

        if (randomValue < maxValidValue) {
          return charset[randomValue % charsetLength]
        }
      }
    }

    if (
      lengthOrPattern === undefined ||
      lengthOrPattern === null ||
      typeof lengthOrPattern === 'number'
    ) {
      const length = lengthOrPattern || DEFAULT_STR_LENGTH
      const charset = type ? charSets[type] : charSets['alphanumeric']

      // Generate token of specified length
      let token = ''
      for (let i = 0; i < length; i++) {
        token += getUnbiasedRandomChar(charset)
      }

      return token
    }

    // Handle pattern string
    const pattern = lengthOrPattern
    return pattern.replace(/[9aA]/g, (match) => {
      let charset = ''

      if (match === '9') charset = charSets.numeric
      else if (match === 'A') charset = charSets.uppercase
      else if (match === 'a') charset = charSets.alphabetic

      return getUnbiasedRandomChar(charset)
    })
  },

  /**
   * Sets an expiry date based on a validity period string.
   * @param {string} validityPeriod - A string like "10 minutes" or "2 hours".
   * @returns {Date} The expiry date and time.
   * @throws {Error} If the time unit is invalid.
   */
  setExpiryDate(validityPeriod) {
    const [n, t] = validityPeriod.split(' ')
    const num = parseInt(n, 10)
    let multiplier
    const time = t.toLowerCase()

    if (time.includes('second')) multiplier = 1000
    else if (time.includes('minute')) multiplier = 60 * 1000
    else if (time.includes('hour')) multiplier = 60 * 60 * 1000
    else
      throw new Error(
        "Invalid time unit. Only 'seconds', 'minutes' or 'hours' are supported."
      )

    const expiryTime = Date.now() + num * multiplier
    return new Date(expiryTime)
  },

  /**
   * Checks if the supplied date has expired.
   * @param {Date | string | number} expiryTime - The expiry time as a Date object, timestamp, or ISO string.
   * @returns {boolean} True if expired, otherwise false.
   */
  isDateExpired(expiryTime) {
    return Date.now() > new Date(expiryTime).getTime()
  },

  /**
   * Signs a JWT token for authentication
   *
   * @param {Object} user - The user object to encode in the token
   * @param {string|Object} user._id - The user's unique identifier
   * @param {string} user.email - The user's email address
   * @param {import('jsonwebtoken').SignOptions} [options={}] - JWT sign options
   * @param {string|number} [options.expiresIn='1h'] - Token expiration time
   * @returns {string} The signed JWT token
   * @see https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
   */
  signJWT(user, options = {}) {
    const signOptions = {
      expiresIn: '30d',
      ...options
    }

    return jwt.sign(
      { userId: user._id, email: user.email },
      env.get('JWT_SECRET'),
      signOptions
    )
  },

  objectIdValidator(modelName, paramName = 'id') {
    return async (req, res, next) => {
      const { [paramName]: id } = req.params

      if (!id || !isObjectIdOrHexString(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${modelName} ID provided`
        })
      }

      next()
    }
  }
}

module.exports = helpers
