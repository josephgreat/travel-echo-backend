const cloudinary = require('cloudinary')
const logger = require('./logger')
const crypto = require('node:crypto')

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
    
    if (!(typeof obj === 'object' && obj !== null && !Array.isArray(obj))) return {};
  
     // If fields is passed as an array, extract it
    if (Array.isArray(fields[0])) fields = fields[0];

    return fields.reduce((acc, field) => {
      const keys = field.split(".");
      let value = obj;

      for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }

      if (value !== undefined) {
        if (keys.length === 1) {
          // If the field is not nested, assign directly
          acc[keys[0]] = value;
        } else {
          // Handle nested properties
          keys.reduce((nestedObj, key, index) => {
            if (index === keys.length - 1) {
              nestedObj[key] = value;
            } else {
              nestedObj[key] = nestedObj[key] || {};
            }
            return nestedObj[key];
          }, acc);
        }
      }
      return acc;
    }, {});
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
      logger.error(`Error uploading image to Cloudinary: ${error.message ?? error}`)
      throw error
    }
  },

  async removeCloudinaryAsset(asset, options) {
    try {
      const result = await cloudinary.v2.uploader.destroy(asset, options)
      return result
    } catch (error) {
      logger.error(`Error removing image from Cloudinary: ${error.message ?? error}`)
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
  
    const charSet = (type && charSets[type]) ? charSets[type] : charSets['numeric']
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

  setTokenExpiry(validityPeriod) {
    const [n, t] = validityPeriod.split(' ')
    const num = parseInt(n, 10)
    let multiplier
    const time = t.toLowerCase()
    
    if (time.includes('second')) multiplier = 1000
    else if (time.includes('minute')) multiplier = 60 * 1000
    else if (time.includes('hour')) multiplier = 60 * 60 * 1000
    else throw new Error("Invalid time unit. Only 'seconds', 'minutes' or 'hours' are supported.")

    const expiryTime = Date.now() + num * multiplier
    return new Date(expiryTime)
  },

  isTokenExpired(expiryTime) {
    const currentTime = Date.now()
    return new Date(currentTime) > new Date(expiryTime)
  }
}

module.exports = helpers
