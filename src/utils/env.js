/**
- Environment variable utility module.
- 
- This module loads environment variables from a .env file using dotenv,
- and provides methods for getting, setting, and checking the existence of
- environment variables.
- 
- @module env
*/

const dotenv = require('dotenv')

/**
- Load environment variables from a .env file.
-
*/
dotenv.config()

/**
- Environment variable utility object.
- 
- @typedef {Object} Env
- @property {Function} get - Get the value of an environment variable.
- @property {Function} set - Set the value of an environment variable.
- @property {Function} has - Check if an environment variable exists.
*/

const env = {
  /**
- Get the value of an environment variable.
- 
- If the variable is not set, returns the provided default value.
- 
- @param {string} key - The name of the environment variable.
- @param {*} [defaultValue] - The default value to return if the variable is not set.
- @returns {*} The value of the environment variable, or the default value.
*/
  get: (key, defaultValue) => process.env[key] ?? defaultValue ?? '',

  /**
- Set the value of an environment variable.
- 
- @param {string} key - The name of the environment variable.
- @param {*} value - The value to set for the environment variable.
*/
  set: (key, value) => {
    process.env[key] = value
  },

  /**
- Check if an environment variable exists.
- 
- @param {string} key - The name of the environment variable.
- @returns {boolean} True if the variable exists, false otherwise.
*/
  has: (key) => Object.prototype.hasOwnProperty.call(process.env, key)
}

module.exports = env
