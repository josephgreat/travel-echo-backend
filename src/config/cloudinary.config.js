const cloudinary = require('cloudinary')
const env = require('#utils/env')

const initializeCloudinary = () => {
  cloudinary.v2.config({
    cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
    api_key: env.get('CLOUDINARY_API_KEY'),
    api_secret: env.get('CLOUDINARY_API_SECRET'),
    secure: true
  })
}

module.exports = initializeCloudinary
