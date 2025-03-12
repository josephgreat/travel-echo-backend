const repository = require("../../utils/repository");

// profile.controller.js
module.exports = {
  // Controller methods for profile,
  createProfile: () => repository('profile').POST(),
  getProfiles: () => repository('profile').GET(),
  updateProfile: () => repository('profile').UPDATE()
}