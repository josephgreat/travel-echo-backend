const Profile = require("#models/profile.model")
const User = require("#models/user.model")
const { uploadCloudinaryAsset, removeCloudinaryAsset } = require("#utils/helpers")

module.exports = {
  uploadProfileImage: async (req, res, next) => {
    const { id } = req.params
    const files = req.files
    
    if (!files || !Object.keys(files).length) {
      return res.status(400).json({
        success: false,
        message: "No profile image uploaded",
      });
    }
  
    const file = Object.values(files)[0];
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No profile image uploaded",
      });
    }
   
  
    try {
      let userProfile = await Profile.findById(id) || await Profile.findOne({ user: id })
  
      if (!userProfile) {
        const user = await User.findById(id)
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'No user or profile found.'
          })
        }
        userProfile = await Profile.create({ user: user._id })
      }
  
      const imagePublicId = `PROFILE-IMG-${userProfile._id.toString()}`
  
      const result = await uploadCloudinaryAsset(file.data, {
        asset_folder: 'PROFILE_IMAGES',
        display_name: imagePublicId,
        public_id: imagePublicId
      })
  
      userProfile.image = result.secure_url
  
      await userProfile.save()
  
      return res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully.',
        imageUrl: result.secure_url
      })
  
    } catch(error) {
      next(error)
    }
  },

  removeProfileImage: async (req, res, next) => {
    const { id } = req.params
  
    try {
      let userProfile = await Profile.findById(id) || await Profile.findOne({ user: id })
  
      if (!userProfile) {
        const user = await User.findById(id)
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'No user or profile found.'
          })
        }
        userProfile = await Profile.create({ user: user._id })
      }
  
      const imagePublicId = `PROFILE-IMG-${userProfile._id.toString()}`

      await removeCloudinaryAsset(imagePublicId, {
        invalidate: true
      })
  
  
      userProfile.image = undefined
  
      await userProfile.save()
  
      return res.status(200).json({
        success: true,
        message: 'Profile image removed successfully.',
      })
  
    } catch(error) {
      next(error)
    }
  }
}