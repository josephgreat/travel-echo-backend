const cloudinary = require('cloudinary')
const logger = require('./logger')

module.exports = {
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
  }
}
