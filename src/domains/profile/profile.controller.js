const repository = require('#database/repository')

// profile.controller.js
module.exports = {
  // Profile,
  createProfile: () => repository('profile').POST(),
  getProfile: () => repository('profile').GET(),
  updateProfile: () => repository('profile').UPDATE(),

  //Profile Image
  uploadProfileImage: () =>
    require('./services/profile-image.service').uploadProfileImage,
  removeProfileImage: () =>
    require('./services/profile-image.service').removeProfileImage
}
